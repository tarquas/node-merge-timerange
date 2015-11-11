'use strict';
require('esfunctional');

/* global spawn, catchify, promisify,
      values, clone, cloneDeep, forEach, extend,
      zipObject, pick, groupBy, fill,
      mapValues, reduce, map, filter, flatten */

let S = module.exports;

S.propsIter = (from, to, props, func) => {

  //jshint maxcomplexity: 9

  if (props) {
    for (let prop of props) {
      let ents = prop.split('.');
      let fromEnt = from;
      let toEnt = to;
      let ent;

      while (ents.length > 1) {
        ent = ents.shift();
        if (fromEnt) fromEnt = fromEnt[ent];
        if (toEnt) {
          if (!toEnt[ent] && (fromEnt || !from)) toEnt[ent] = {};
          toEnt = toEnt[ent];
        }
      }

      ent = ents[0];

      if (toEnt) func(fromEnt, toEnt, ent);
    }
  }
};

S.propsCopy = (from, to, props) => {
  S.propsIter(from, to, props, (from, to, prop) => {
    if (from[prop]) to[prop] = from[prop];
  });
};

S.propsRange = (from, to, props) => {
  S.propsIter(from, to, props, (from, to, prop) => {

    //jshint maxcomplexity: 7

    if (from[prop]) {
      if (to[prop]) {
        if (to[prop] == null || from[prop].min < to[prop].min) to[prop].min = from[prop].min;
        if (to[prop] == null || from[prop].max > to[prop].max) to[prop].max = from[prop].max;
      } else {
        to[prop] = from[prop] [clone]();
      }
    }
  });
};

S.propsSum = (from, to, props) => {
  S.propsIter(from, to, props, (from, to, prop) => {
    if (from[prop]) to[prop] = (to[prop] - 0 || 0) + (from[prop] - 0 || 0);
  });
};

S.propsSet = (val, to, props) => {
  S.propsIter(null, to, props, (from, to, prop) => {
    to[prop] = val;
  });
};

// {
//   maxInterval: sec
//   from: ...
//   to: ...
//   prop: {
//     check: [String],
//     copy: [String],
//     range: [String],
//     sum: [String]
//   },
//   remove: Boolean,
//   overwrite: Boolean
// }
S.mergeTimeranges = (arg) => {

  //jshint maxcomplexity: 19

  let max = arg.maxInterval ? arg.maxInterval * 1000 : 0;
  let froms = arg.from;
  let tos = arg.to;
  let fromIdx = 0;
  let toIdx = 0;

  let from = froms[fromIdx];
  let to = tos[toIdx];

  if (!arg.prop) arg.prop = {};

  while (from) {
    while (to && from.start - max >= to.end) to = tos[++toIdx];

    if (!to || from.end < to.start - max) {
      if (!arg.remove) {
        to = from [cloneDeep]() [extend]({
          time: (from.end - from.start) / 1000
        });

        tos.splice(toIdx, 0, to);
      }

      from = froms[++fromIdx];
      continue;
    }

    if (arg.remove) {
      let newItem = null;

      if (to.start < from.start) {
        newItem = to [cloneDeep]() [extend]({
          end: from.start,
          time: (from.start - to.start) / 1000
        });

        S.propsSet(0, newItem, arg.prop.sum);

        tos.splice(toIdx++, 0, newItem);
      }

      if (to.end > from.end) {
        to.start = from.end;
        to.time = (to.end - from.end) / 1000;
        from = froms[++fromIdx];
      } else {
        tos.splice(toIdx, 1);
        to = tos[toIdx];
      }

      continue;
    }

    let needMerge = !arg.remove;

    if (needMerge && arg.prop.check) arg.prop.check [forEach]((prop) => needMerge = (
      from[prop] === to[prop]
    ));

    if (needMerge) {
      if (from.start < to.start) to.start = from.start;
      if (from.end > to.end) to.end = from.end;

      S.propsSum(from, to, arg.prop.sum);
      S.propsCopy(from, to, arg.prop.copy);
      S.propsRange(from, to, arg.prop.range);

      to.time = (to.end - to.start) / 1000;

      from = to;
      tos.splice(toIdx, 1);
      to = tos[toIdx];
    } else {
      if (from.start < to.start) {
        let newItem = from [cloneDeep]() [extend]({
          end: to.start,
          time: (to.start - from.start) / 1000
        });

        S.propsSet(0, newItem, arg.prop.sum);

        tos.splice(toIdx++, 0, newItem);
      }

      if (from.end > to.end) {
        from = from [cloneDeep]() [extend]({
          start: to.end,
          time: (from.end - to.end) / 1000
        });

        to = tos[++toIdx];
      } else {
        from = froms[++fromIdx];
      }
    }
  }

  return tos;
};

// {
//   maxInterval: sec,
//   rangeItems: [in, out] Array,
//   inserts: [out] Array,
//   removes: [out] Array,
//   removeCmds: [out] Array,
//   Model: MongooseModel,
//   prop: {
//     head: [String],
//     check: [String],
//     copy: [String],
//     range: [String],
//     sum: [String]
//   }
// }
S.normalize = (arg) => spawn(function*() {
  let maxIntervalMsec = arg.maxInterval ? arg.maxInterval * 1000 : 0;

  let byAll = arg.rangeItems [groupBy](rangeItem => JSON.stringify(
    rangeItem [pick](arg.prop.head)
  ));

  let sort = arg.prop.head ? arg.prop.head [zipObject](new Array(arg.prop.head.length) [fill](1)) : {};

  let sortByStart = ({}) [extend](sort) [extend]({start: 1, _id: 1});
  let sortByEnd = ({}) [extend](sort) [extend]({end: 1, _id: 1});

  let ranges = byAll [mapValues]((group) => group [reduce]((g1, g2) => ({
    start: g1.start < g2.start ? g1.start : g2.start,
    end: g1.end < g2.end ? g2.end : g1.end
  }), {}) [extend]({head: group[0] [pick](arg.prop.head)}));

  yield Promise.all(ranges [map]((range, key) => spawn(function*() {
    let starting = yield arg.Model.findOne(
      ({end: {$gte: new Date(range.start - maxIntervalMsec)}}) [extend](range.head),
      {_id: 0, start: 1}
    ).sort(sortByEnd).exec() [catchify]();

    let startCond = {};
    if (starting) startCond.$gte = starting.start;
    startCond.$lte = new Date(range.end - 0 + maxIntervalMsec);

    let found = yield arg.Model.find(
      ({start: startCond}) [extend](range.head),
      {_id: 0, modifiedAt: 0}
    ).sort(sortByStart).exec() [catchify]();

    let result = found.map(item => item.toObject());

    let foundEnds = result.map(item => [item.start - 0, {
      end: item.end - 0,
      item: item [cloneDeep]()
    }]) [zipObject]();

    S.mergeTimeranges({
      maxInterval: arg.maxInterval,
      from: byAll[key],
      to: result,
      prop: arg.prop,
      remove: arg.remove,
      overwrite: arg.overwrite
    });

    range.result = result;

    range.inserts = result [filter](item => {
      let start = item.start - 0;
      let fItem = foundEnds[start];
      let end = fItem && fItem.end;
      if (end !== item.end - 0) return true;
      if (end != null) delete foundEnds[start];
      return false;
    });

    range.removeCmds = foundEnds [map]((item, start) => (
      ({}) [extend](range.head)
      [extend]({
        start: new Date(start - 0),
        end: new Date(item.end - 0)
      })
    ));

    range.removes = foundEnds [map](item => item.item);
  })));

  arg.rangeItems = ranges [map](range => range.result) [flatten]();
  arg.inserts = ranges [map](range => range.inserts) [flatten]();
  arg.removes = ranges [map](range => range.removes) [flatten]();
  arg.removeCmds = ranges [map](range => range.removeCmds) [flatten]();

  return true;
});

// {
//   inserts: [out] Array,
//   removeCmds: [out] Array,
//   Model: MongooseModel,
//   prop: {
//     head: [String],
//     check: [String],
//     copy: [String],
//     range: [String],
//     sum: [String]
//   }
// }
S.save = (arg) => spawn(function*() {
  let fields = arg.prop [values]() [flatten]() [map](prop => prop.split('.')[0]);
  fields.push('start', 'end', 'time');

  let tasks = [];

  if (arg.inserts && arg.inserts.length) tasks.push(
    arg.Model.collection [promisify]('insert')(arg.inserts [map](item => item [pick](fields)))
  );

  if (arg.removeCmds && arg.removeCmds.length) tasks.push(
    arg.Model.remove(arg.removeCmds)
  );

  return !tasks.length ? [] : yield Promise.all(tasks);
});
