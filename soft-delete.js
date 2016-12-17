'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends6 = require('babel-runtime/helpers/extends');

var _extends7 = _interopRequireDefault(_extends6);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _debug2 = require('./debug');

var _debug3 = _interopRequireDefault(_debug2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug3.default)();

exports.default = function (Model, _ref) {
  var _ref$deletedAt = _ref.deletedAt,
      deletedAt = _ref$deletedAt === undefined ? 'deletedAt' : _ref$deletedAt,
      _ref$scrub = _ref.scrub,
      scrub = _ref$scrub === undefined ? false : _ref$scrub;

  debug('SoftDelete mixin for Model %s', Model.modelName);

  debug('options', { deletedAt: deletedAt, scrub: scrub });

  var properties = Model.definition.properties;
  var idName = Model.dataSource.idName(Model.modelName);

  var scrubbed = {};
  if (scrub !== false) {
    var propertiesToScrub = scrub;
    if (!Array.isArray(propertiesToScrub)) {
      propertiesToScrub = (0, _keys2.default)(properties).filter(function (prop) {
        return !properties[prop][idName] && prop !== deletedAt;
      });
    }
    scrubbed = propertiesToScrub.reduce(function (obj, prop) {
      return (0, _extends7.default)({}, obj, (0, _defineProperty3.default)({}, prop, null));
    }, {});
  }

  Model.defineProperty(deletedAt, { type: Date, required: false });

  Model.destroyAll = function softDestroyAll(where, cb) {
    return Model.updateAll(where, (0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return typeof cb === 'function' ? cb(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? cb(error) : _promise2.default.reject(error);
    });
  };

  Model.remove = Model.destroyAll;
  Model.deleteAll = Model.destroyAll;

  Model.destroyById = function softDestroyById(id, cb) {
    return Model.updateAll((0, _defineProperty3.default)({}, idName, id), (0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return typeof cb === 'function' ? cb(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? cb(error) : _promise2.default.reject(error);
    });
  };

  Model.removeById = Model.destroyById;
  Model.deleteById = Model.destroyById;

  Model.prototype.destroy = function softDestroy(options, cb) {
    var callback = cb === undefined && typeof options === 'function' ? options : cb;

    return this.updateAttributes((0, _extends7.default)({}, scrubbed, (0, _defineProperty3.default)({}, deletedAt, new Date()))).then(function (result) {
      return typeof cb === 'function' ? callback(null, result) : result;
    }).catch(function (error) {
      return typeof cb === 'function' ? callback(error) : _promise2.default.reject(error);
    });
  };

  Model.prototype.remove = Model.prototype.destroy;
  Model.prototype.delete = Model.prototype.destroy;

  // Emulate default scope but with more flexibility.
  var queryNonDeleted = (0, _defineProperty3.default)({}, deletedAt, undefined);

  var _findOrCreate = Model.findOrCreate;
  Model.findOrCreate = function findOrCreateDeleted() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!query.deleted) {
      if (!query.where || (0, _keys2.default)(query.where).length === 0) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }

    return _findOrCreate.call.apply(_findOrCreate, [Model, query].concat(rest));
  };

  var _find = Model.find;
  Model.find = function findDeleted() {
    var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (!query.deleted) {
      if (!query.where || (0, _keys2.default)(query.where).length === 0) {
        query.where = queryNonDeleted;
      } else {
        query.where = { and: [query.where, queryNonDeleted] };
      }
    }

    for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      rest[_key2 - 1] = arguments[_key2];
    }

    return _find.call.apply(_find, [Model, query].concat(rest));
  };

  var _count = Model.count;
  Model.count = function countDeleted() {
    var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Because count only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = void 0;
    if (!where || (0, _keys2.default)(where).length === 0) {
      whereNotDeleted = queryNonDeleted;
    } else {
      whereNotDeleted = { and: [where, queryNonDeleted] };
    }

    for (var _len3 = arguments.length, rest = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      rest[_key3 - 1] = arguments[_key3];
    }

    return _count.call.apply(_count, [Model, whereNotDeleted].concat(rest));
  };

  var _update = Model.update;
  Model.update = Model.updateAll = function updateDeleted() {
    var where = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    // Because update/updateAll only receives a 'where', there's nowhere to ask for the deleted entities.
    var whereNotDeleted = void 0;
    if (!where || (0, _keys2.default)(where).length === 0) {
      whereNotDeleted = queryNonDeleted;
    } else {
      whereNotDeleted = { and: [where, queryNonDeleted] };
    }

    for (var _len4 = arguments.length, rest = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      rest[_key4 - 1] = arguments[_key4];
    }

    return _update.call.apply(_update, [Model, whereNotDeleted].concat(rest));
  };
};

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNvZnQtZGVsZXRlLmpzIl0sIm5hbWVzIjpbImRlYnVnIiwiTW9kZWwiLCJkZWxldGVkQXQiLCJzY3J1YiIsIm1vZGVsTmFtZSIsInByb3BlcnRpZXMiLCJkZWZpbml0aW9uIiwiaWROYW1lIiwiZGF0YVNvdXJjZSIsInNjcnViYmVkIiwicHJvcGVydGllc1RvU2NydWIiLCJBcnJheSIsImlzQXJyYXkiLCJmaWx0ZXIiLCJwcm9wIiwicmVkdWNlIiwib2JqIiwiZGVmaW5lUHJvcGVydHkiLCJ0eXBlIiwiRGF0ZSIsInJlcXVpcmVkIiwiZGVzdHJveUFsbCIsInNvZnREZXN0cm95QWxsIiwid2hlcmUiLCJjYiIsInVwZGF0ZUFsbCIsInRoZW4iLCJyZXN1bHQiLCJjYXRjaCIsImVycm9yIiwicmVqZWN0IiwicmVtb3ZlIiwiZGVsZXRlQWxsIiwiZGVzdHJveUJ5SWQiLCJzb2Z0RGVzdHJveUJ5SWQiLCJpZCIsInJlbW92ZUJ5SWQiLCJkZWxldGVCeUlkIiwicHJvdG90eXBlIiwiZGVzdHJveSIsInNvZnREZXN0cm95Iiwib3B0aW9ucyIsImNhbGxiYWNrIiwidW5kZWZpbmVkIiwidXBkYXRlQXR0cmlidXRlcyIsImRlbGV0ZSIsInF1ZXJ5Tm9uRGVsZXRlZCIsIl9maW5kT3JDcmVhdGUiLCJmaW5kT3JDcmVhdGUiLCJmaW5kT3JDcmVhdGVEZWxldGVkIiwicXVlcnkiLCJkZWxldGVkIiwibGVuZ3RoIiwiYW5kIiwicmVzdCIsImNhbGwiLCJfZmluZCIsImZpbmQiLCJmaW5kRGVsZXRlZCIsIl9jb3VudCIsImNvdW50IiwiY291bnREZWxldGVkIiwid2hlcmVOb3REZWxldGVkIiwiX3VwZGF0ZSIsInVwZGF0ZSIsInVwZGF0ZURlbGV0ZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7O0FBQ0EsSUFBTUEsUUFBUSxzQkFBZDs7a0JBRWUsVUFBQ0MsS0FBRCxRQUF1RDtBQUFBLDRCQUE3Q0MsU0FBNkM7QUFBQSxNQUE3Q0Es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bEI7QUFDRDs7QUFQc0QsdUNBQU5RLElBQU07QUFBTkEsVUFBTTtBQUFBOztBQVF2RCxXQUFPSyxPQUFPSixJQUFQLGdCQUFZdEQsS0FBWixFQUFtQjZELGVBQW5CLFNBQXVDUixJQUF2QyxFQUFQO0FBQ0QsR0FURDs7QUFXQSxNQUFNUyxVQUFVOUQsTUFBTStELE1BQXRCO0FBQ0EvRCxRQUFNK0QsTUFBTixHQUFlL0QsTUFBTXdCLFNBQU4sR0FBa0IsU0FBU3dDLGFBQVQsR0FBNEM7QUFBQSxRQUFyQjFDLEtBQXFCLHVFQUFiLEVBQWE7O0FBQzNFO0FBQ0EsUUFBSXVDLHdCQUFKO0FBQ0EsUUFBSSxDQUFDdkMsS0FBRCxJQUFVLG9CQUFZQSxLQUFaLEVBQW1CNkIsTUFBbkIsS0FBOEIsQ0FBNUMsRUFBK0M7QUFDN0NVLHdCQUFrQmhCLGVBQWxCO0FBQ0QsS0FGRCxNQUVPO0FBQ0xnQix3QkFBa0IsRUFBRVQsS0FBSyxDQUFFOUIsS0FBRixFQUFTdUIsZUFBVCxDQUFQLEVBQWxCO0FBQ0Q7O0FBUDBFLHVDQUFOUSxJQUFNO0FBQU5BLFVBQU07QUFBQTs7QUFRM0UsV0FBT1MsUUFBUVIsSUFBUixpQkFBYXRELEtBQWIsRUFBb0I2RCxlQUFwQixTQUF3Q1IsSUFBeEMsRUFBUDtBQUNELEdBVEQ7QUFVRCxDIiwiZmlsZSI6InNvZnQtZGVsZXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IF9kZWJ1ZyBmcm9tICcuL2RlYnVnJztcbmNvbnN0IGRlYnVnID0gX2RlYnVnKCk7XG5cbmV4cG9ydCBkZWZhdWx0IChNb2RlbCwgeyBkZWxldGVkQXQgPSAnZGVsZXRlZEF0Jywgc2NydWIgPSBmYWxzZSB9KSA9PiB7XG4gIGRlYnVnKCdTb2Z0RGVsZXRlIG1peGluIGZvciBNb2RlbCAlcycsIE1vZGVsLm1vZGVsTmFtZSk7XG5cbiAgZGVidWcoJ29wdGlvbnMnLCB7IGRlbGV0ZWRBdCwgc2NydWIgfSk7XG5cbiAgY29uc3QgcHJvcGVydGllcyA9IE1vZGVsLmRlZmluaXRpb24ucHJvcGVydGllcztcbiAgY29uc3QgaWROYW1lID0gTW9kZWwuZGF0YVNvdXJjZS5pZE5hbWUoTW9kZWwubW9kZWxOYW1lKTtcblxuICBsZXQgc2NydWJiZWQgPSB7fTtcbiAgaWYgKHNjcnViICE9PSBmYWxzZSkge1xuICAgIGxldCBwcm9wZXJ0aWVzVG9TY3J1YiA9IHNjcnViO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShwcm9wZXJ0aWVzVG9TY3J1YikpIHtcbiAgICAgIHByb3BlcnRpZXNUb1NjcnViID0gT2JqZWN0LmtleXMocHJvcGVydGllcylcbiAgICAgICAgLmZpbHRlcihwcm9wID0+ICFwcm9wZXJ0aWVzW3Byb3BdW2lkTmFtZV0gJiYgcHJvcCAhPT0gZGVsZXRlZEF0KTtcbiAgICB9XG4gICAgc2NydWJiZWQgPSBwcm9wZXJ0aWVzVG9TY3J1Yi5yZWR1Y2UoKG9iaiwgcHJvcCkgPT4gKHsgLi4ub2JqLCBbcHJvcF06IG51bGwgfSksIHt9KTtcbiAgfVxuXG4gIE1vZGVsLmRlZmluZVByb3BlcnR5KGRlbGV0ZWRBdCwge3R5cGU6IERhdGUsIHJlcXVpcmVkOiBmYWxzZX0pO1xuXG4gIE1vZGVsLmRlc3Ryb3lBbGwgPSBmdW5jdGlvbiBzb2Z0RGVzdHJveUFsbCh3aGVyZSwgY2IpIHtcbiAgICByZXR1cm4gTW9kZWwudXBkYXRlQWxsKHdoZXJlLCB7IC4uLnNjcnViYmVkLCBbZGVsZXRlZEF0XTogbmV3IERhdGUoKSB9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+ICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpID8gY2IobnVsbCwgcmVzdWx0KSA6IHJlc3VsdClcbiAgICAgIC5jYXRjaChlcnJvciA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNiKGVycm9yKSA6IFByb21pc2UucmVqZWN0KGVycm9yKSk7XG4gIH07XG5cbiAgTW9kZWwucmVtb3ZlID0gTW9kZWwuZGVzdHJveUFsbDtcbiAgTW9kZWwuZGVsZXRlQWxsID0gTW9kZWwuZGVzdHJveUFsbDtcblxuICBNb2RlbC5kZXN0cm95QnlJZCA9IGZ1bmN0aW9uIHNvZnREZXN0cm95QnlJZChpZCwgY2IpIHtcbiAgICByZXR1cm4gTW9kZWwudXBkYXRlQWxsKHsgW2lkTmFtZV06IGlkIH0sIHsgLi4uc2NydWJiZWQsIFtkZWxldGVkQXRdOiBuZXcgRGF0ZSgpfSlcbiAgICAgIC50aGVuKHJlc3VsdCA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNiKG51bGwsIHJlc3VsdCkgOiByZXN1bHQpXG4gICAgICAuY2F0Y2goZXJyb3IgPT4gKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgPyBjYihlcnJvcikgOiBQcm9taXNlLnJlamVjdChlcnJvcikpO1xuICB9O1xuXG4gIE1vZGVsLnJlbW92ZUJ5SWQgPSBNb2RlbC5kZXN0cm95QnlJZDtcbiAgTW9kZWwuZGVsZXRlQnlJZCA9IE1vZGVsLmRlc3Ryb3lCeUlkO1xuXG4gIE1vZGVsLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gc29mdERlc3Ryb3kob3B0aW9ucywgY2IpIHtcbiAgICBjb25zdCBjYWxsYmFjayA9IChjYiA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSA/IG9wdGlvbnMgOiBjYjtcblxuICAgIHJldHVybiB0aGlzLnVwZGF0ZUF0dHJpYnV0ZXMoeyAuLi5zY3J1YmJlZCwgW2RlbGV0ZWRBdF06IG5ldyBEYXRlKCkgfSlcbiAgICAgIC50aGVuKHJlc3VsdCA9PiAodHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSA/IGNhbGxiYWNrKG51bGwsIHJlc3VsdCkgOiByZXN1bHQpXG4gICAgICAuY2F0Y2goZXJyb3IgPT4gKHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgPyBjYWxsYmFjayhlcnJvcikgOiBQcm9taXNlLnJlamVjdChlcnJvcikpO1xuICB9O1xuXG4gIE1vZGVsLnByb3RvdHlwZS5yZW1vdmUgPSBNb2RlbC5wcm90b3R5cGUuZGVzdHJveTtcbiAgTW9kZWwucHJvdG90eXBlLmRlbGV0ZSA9IE1vZGVsLnByb3RvdHlwZS5kZXN0cm95O1xuXG4gIC8vIEVtdWxhdGUgZGVmYXVsdCBzY29wZSBidXQgd2l0aCBtb3JlIGZsZXhpYmlsaXR5LlxuICBjb25zdCBxdWVyeU5vbkRlbGV0ZWQgPSB7W2RlbGV0ZWRBdF06IHVuZGVmaW5lZH07XG5cbiAgY29uc3QgX2ZpbmRPckNyZWF0ZSA9IE1vZGVsLmZpbmRPckNyZWF0ZTtcbiAgTW9kZWwuZmluZE9yQ3JlYXRlID0gZnVuY3Rpb24gZmluZE9yQ3JlYXRlRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlIHx8IE9iamVjdC5rZXlzKHF1ZXJ5LndoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHsgYW5kOiBbIHF1ZXJ5LndoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmluZE9yQ3JlYXRlLmNhbGwoTW9kZWwsIHF1ZXJ5LCAuLi5yZXN0KTtcbiAgfTtcblxuICBjb25zdCBfZmluZCA9IE1vZGVsLmZpbmQ7XG4gIE1vZGVsLmZpbmQgPSBmdW5jdGlvbiBmaW5kRGVsZXRlZChxdWVyeSA9IHt9LCAuLi5yZXN0KSB7XG4gICAgaWYgKCFxdWVyeS5kZWxldGVkKSB7XG4gICAgICBpZiAoIXF1ZXJ5LndoZXJlIHx8IE9iamVjdC5rZXlzKHF1ZXJ5LndoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcXVlcnkud2hlcmUgPSBxdWVyeU5vbkRlbGV0ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBxdWVyeS53aGVyZSA9IHsgYW5kOiBbIHF1ZXJ5LndoZXJlLCBxdWVyeU5vbkRlbGV0ZWQgXSB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBfZmluZC5jYWxsKE1vZGVsLCBxdWVyeSwgLi4ucmVzdCk7XG4gIH07XG5cbiAgY29uc3QgX2NvdW50ID0gTW9kZWwuY291bnQ7XG4gIE1vZGVsLmNvdW50ID0gZnVuY3Rpb24gY291bnREZWxldGVkKHdoZXJlID0ge30sIC4uLnJlc3QpIHtcbiAgICAvLyBCZWNhdXNlIGNvdW50IG9ubHkgcmVjZWl2ZXMgYSAnd2hlcmUnLCB0aGVyZSdzIG5vd2hlcmUgdG8gYXNrIGZvciB0aGUgZGVsZXRlZCBlbnRpdGllcy5cbiAgICBsZXQgd2hlcmVOb3REZWxldGVkO1xuICAgIGlmICghd2hlcmUgfHwgT2JqZWN0LmtleXMod2hlcmUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgd2hlcmVOb3REZWxldGVkID0gcXVlcnlOb25EZWxldGVkO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aGVyZU5vdERlbGV0ZWQgPSB7IGFuZDogWyB3aGVyZSwgcXVlcnlOb25EZWxldGVkIF0gfTtcbiAgICB9XG4gICAgcmV0dXJuIF9jb3VudC5jYWxsKE1vZGVsLCB3aGVyZU5vdERlbGV0ZWQsIC4uLnJlc3QpO1xuICB9O1xuXG4gIGNvbnN0IF91cGRhdGUgPSBNb2RlbC51cGRhdGU7XG4gIE1vZGVsLnVwZGF0ZSA9IE1vZGVsLnVwZGF0ZUFsbCA9IGZ1bmN0aW9uIHVwZGF0ZURlbGV0ZWQod2hlcmUgPSB7fSwgLi4ucmVzdCkge1xuICAgIC8vIEJlY2F1c2UgdXBkYXRlL3VwZGF0ZUFsbCBvbmx5IHJlY2VpdmVzIGEgJ3doZXJlJywgdGhlcmUncyBub3doZXJlIHRvIGFzayBmb3IgdGhlIGRlbGV0ZWQgZW50aXRpZXMuXG4gICAgbGV0IHdoZXJlTm90RGVsZXRlZDtcbiAgICBpZiAoIXdoZXJlIHx8IE9iamVjdC5rZXlzKHdoZXJlKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHdoZXJlTm90RGVsZXRlZCA9IHF1ZXJ5Tm9uRGVsZXRlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgd2hlcmVOb3REZWxldGVkID0geyBhbmQ6IFsgd2hlcmUsIHF1ZXJ5Tm9uRGVsZXRlZCBdIH07XG4gICAgfVxuICAgIHJldHVybiBfdXBkYXRlLmNhbGwoTW9kZWwsIHdoZXJlTm90RGVsZXRlZCwgLi4ucmVzdCk7XG4gIH07XG59O1xuIl19
