(function() {
  var $, Traslator, container, injector,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Traslator = (function() {
    Traslator.prototype._htmlPositions = [];

    Traslator.prototype._textPositions = [];

    Traslator.prototype._html = '';

    Traslator.prototype._text = '';

    Traslator.create = function(html) {
      var traslator;
      traslator = new Traslator(html);
      traslator.parse();
      return traslator;
    };

    function Traslator(html) {
      this._html = html;
    }

    Traslator.prototype.parse = function() {
      var htmlElem, htmlLength, htmlPost, htmlPre, match, pattern, textLength, textPost, textPre, _results;
      this._htmlPositions = [];
      this._textPositions = [];
      this._text = '';
      pattern = /([^<]*)(<[^>]*>)([^<]*)/gim;
      textLength = 0;
      htmlLength = 0;
      _results = [];
      while (match = pattern.exec(this._html)) {
        htmlPre = match[1];
        htmlElem = match[2];
        htmlPost = match[3];
        textPre = htmlPre + ('</p>' === htmlElem.toLowerCase() ? '\n\n' : '');
        textPost = htmlPost;
        textLength += textPre.length;
        htmlLength += htmlPre.length + htmlElem.length;
        if (0 < htmlPost.length) {
          this._htmlPositions.push(htmlLength);
          this._textPositions.push(textLength);
        }
        textLength += textPost.length;
        htmlLength += htmlPost.length;
        _results.push(this._text += textPre + textPost);
      }
      return _results;
    };

    Traslator.prototype.text2html = function(pos) {
      var htmlPos, i, textPos, _i, _ref;
      htmlPos = this._textPositions[0];
      textPos = this._textPositions[0];
      for (i = _i = 0, _ref = this._textPositions.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (pos < this._textPositions[i]) {
          break;
        }
        htmlPos = this._htmlPositions[i];
        textPos = this._textPositions[i];
      }
      return htmlPos + pos - textPos;
    };

    Traslator.prototype.html2text = function(pos) {
      var htmlPos, i, textPos, _i, _ref;
      htmlPos = this._textPositions[0];
      textPos = this._textPositions[0];
      for (i = _i = 0, _ref = this._htmlPositions.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (pos < this._htmlPositions[i]) {
          break;
        }
        htmlPos = this._htmlPositions[i];
        textPos = this._textPositions[i];
      }
      return textPos + pos - htmlPos;
    };

    Traslator.prototype.insertHtml = function(fragment, pos) {
      var htmlPos;
      htmlPos = this.text2html(pos.text);
      this._html = this._html.substring(0, htmlPos) + fragment + this._html.substring(htmlPos);
      return this.parse();
    };

    Traslator.prototype.getHtml = function() {
      return this._html;
    };

    Traslator.prototype.getText = function() {
      return this._text;
    };

    return Traslator;

  })();

  window.Traslator = Traslator;

  angular.module('wordlift.tinymce.plugin.config', []).constant('Configuration', {
    supportedTypes: ['schema:Place', 'schema:Event', 'schema:CreativeWork', 'schema:Product', 'schema:Person', 'schema:Organization'],
    entityLabels: {
      'entityLabel': 'enhancer:entity-label',
      'entityType': 'enhancer:entity-type',
      'entityReference': 'enhancer:entity-reference',
      'textAnnotation': 'enhancer:TextAnnotation',
      'entityAnnotation': 'enhancer:EntityAnnotation',
      'selectionPrefix': 'enhancer:selection-prefix',
      'selectionSuffix': 'enhancer:selection-suffix',
      'selectedText': 'enhancer:selected-text',
      'confidence': 'enhancer:confidence',
      'relation': 'dc:relation'
    }
  });

  angular.module('wordlift.tinymce.plugin.directives', ['wordlift.tinymce.plugin.controllers']).directive('wlEntities', function() {
    return {
      restrict: 'E',
      scope: {
        textAnnotation: '=',
        onSelect: '&'
      },
      link: function(scope, element, attrs) {
        return scope.select = function(item) {
          var entityAnnotation, id, _ref;
          _ref = scope.textAnnotation.entityAnnotations;
          for (id in _ref) {
            entityAnnotation = _ref[id];
            entityAnnotation.selected = item.id === entityAnnotation.id && !entityAnnotation.selected;
          }
          return scope.onSelect({
            textAnnotation: scope.textAnnotation,
            entityAnnotation: item.selected ? item : null
          });
        };
      },
      template: "<div>\n  <ul>\n    <li ng-repeat=\"entityAnnotation in textAnnotation.entityAnnotations | orderObjectBy:'confidence':true\">\n      <wl-entity on-select=\"select(entityAnnotation)\" entity-annotation=\"entityAnnotation\"></wl-entity>\n    </li>\n  </ul>\n</div>"
    };
  }).directive('wlEntity', function() {
    return {
      restrict: 'E',
      scope: {
        entityAnnotation: '=',
        onSelect: '&'
      },
      template: "<div class=\"entity {{entityAnnotation.entity.type}}\" ng-class=\"{selected: true==entityAnnotation.selected}\" ng-click=\"onSelect()\" ng-show=\"entityAnnotation.entity.label\">\n  <div class=\"thumbnail\" ng-show=\"entityAnnotation.entity.thumbnail\" title=\"{{entityAnnotation.entity.id}}\" ng-attr-style=\"background-image: url({{entityAnnotation.entity.thumbnail}})\"></div>\n  <div class=\"thumbnail empty\" ng-hide=\"entityAnnotation.entity.thumbnail\" title=\"{{entityAnnotation.entity.id}}\"></div>\n  <div class=\"confidence\" ng-bind=\"entityAnnotation.confidence\"></div>\n  <div class=\"label\" ng-bind=\"entityAnnotation.entity.label\"></div>\n  <div class=\"type\"></div>\n  <div class=\"source\" ng-class=\"entityAnnotation.entity.source\" ng-bind=\"entityAnnotation.entity.source\"></div>\n</div>"
    };
  }).directive('wlEntityInputBoxes', function() {
    return {
      restrict: 'E',
      scope: {
        textAnnotations: '='
      },
      template: "<div class=\"wl-entity-input-boxes\" ng-repeat=\"textAnnotation in textAnnotations\">\n  <div ng-repeat=\"entityAnnotation in textAnnotation.entityAnnotations | filterObjectBy:'selected':true\">\n\n    <input type='text' name='wl_entities[{{entityAnnotation.entity.id}}][uri]' value='{{entityAnnotation.entity.id}}'>\n    <input type='text' name='wl_entities[{{entityAnnotation.entity.id}}][label]' value='{{entityAnnotation.entity.label}}'>\n    <textarea name='wl_entities[{{entityAnnotation.entity.id}}][description]'>{{entityAnnotation.entity.description}}</textarea>\n    <input type='text' name='wl_entities[{{entityAnnotation.entity.id}}][type]' value='{{entityAnnotation.entity.type}}'>\n\n    <input ng-repeat=\"image in entityAnnotation.entity.thumbnails\" type='text'\n      name='wl_entities[{{entityAnnotation.entity.id}}][image][]' value='{{image}}'>\n    <input ng-repeat=\"sameAs in entityAnnotation.entity.sameAs\" type='text'\n      name='wl_entities[{{entityAnnotation.entity.id}}][sameas][]' value='{{sameAs}}'>\n\n    <input type='text' name='wl_entities[{{entityAnnotation.entity.id}}][latitude]' value='{{entityAnnotation.entity.latitude}}'>\n    <input type='text' name='wl_entities[{{entityAnnotation.entity.id}}][longitude]' value='{{entityAnnotation.entity.longitude}}'>\n\n  </div>\n</div>"
    };
  });

  angular.module('AnalysisService', []).service('AnalysisService', [
    '$http', '$q', '$rootScope', '$log', function($http, $q, $rootScope, $log) {
      var CONTEXT, GRAPH, service;
      CONTEXT = '@context';
      GRAPH = '@graph';
      service = {
        promise: void 0,
        isRunning: false,
        abort: function() {
          if (this.isRunning && (this.promise != null)) {
            return this.promise.resolve();
          }
        },
        analyze: function(content, merge) {
          var that;
          if (merge == null) {
            merge = false;
          }
          if (this.isRunning) {
            return;
          }
          this.isRunning = true;
          this.promise = $q.defer();
          that = this;
          return $http({
            method: 'post',
            url: ajaxurl + '?action=wordlift_analyze',
            data: content,
            timeout: this.promise.promise
          }).success(function(data, status, headers, config) {
            $rootScope.$broadcast('analysisReceived', that.parse(data, merge));
            return that.isRunning = false;
          }).error(function(data, status, headers, config) {
            that.isRunning = false;
            $rootScope.$broadcast('analysisReceived', null);
            if (0 === status) {
              return;
            }
            return $rootScope.$broadcast('error', 'An error occurred while requesting an analysis.');
          });
        },
        parse: function(data, merge) {
          var anotherEntityAnnotation, anotherId, containsOrEquals, context, createEntity, createEntityAnnotation, createLanguage, createTextAnnotation, dctype, entities, entity, entityAnnotation, entityAnnotations, expand, get, getA, getKnownType, getLanguage, graph, id, item, language, languages, mergeEntities, mergeUnique, textAnnotation, textAnnotationId, textAnnotations, types, _i, _len, _ref, _ref1;
          if (merge == null) {
            merge = false;
          }
          languages = [];
          textAnnotations = {};
          entityAnnotations = {};
          entities = {};
          getKnownType = function(types) {
            var type, typesArray, _i, _j, _k, _l, _len, _len1, _len10, _len11, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _len9, _m, _n, _o, _p, _q, _r, _s, _t;
            if (types == null) {
              return 'thing';
            }
            typesArray = angular.isArray(types) ? types : [types];
            for (_i = 0, _len = typesArray.length; _i < _len; _i++) {
              type = typesArray[_i];
              if ('http://schema.org/Person' === expand(type)) {
                return 'person';
              }
            }
            for (_j = 0, _len1 = typesArray.length; _j < _len1; _j++) {
              type = typesArray[_j];
              if ('http://rdf.freebase.com/ns/people.person' === expand(type)) {
                return 'person';
              }
            }
            for (_k = 0, _len2 = typesArray.length; _k < _len2; _k++) {
              type = typesArray[_k];
              if ('http://schema.org/Organization' === expand(type)) {
                return 'organization';
              }
            }
            for (_l = 0, _len3 = typesArray.length; _l < _len3; _l++) {
              type = typesArray[_l];
              if ('http://rdf.freebase.com/ns/government.government' === expand(type)) {
                return 'organization';
              }
            }
            for (_m = 0, _len4 = typesArray.length; _m < _len4; _m++) {
              type = typesArray[_m];
              if ('http://schema.org/Newspaper' === expand(type)) {
                return 'organization';
              }
            }
            for (_n = 0, _len5 = typesArray.length; _n < _len5; _n++) {
              type = typesArray[_n];
              if ('http://schema.org/Place' === expand(type)) {
                return 'place';
              }
            }
            for (_o = 0, _len6 = typesArray.length; _o < _len6; _o++) {
              type = typesArray[_o];
              if ('http://rdf.freebase.com/ns/location.location' === expand(type)) {
                return 'place';
              }
            }
            for (_p = 0, _len7 = typesArray.length; _p < _len7; _p++) {
              type = typesArray[_p];
              if ('http://schema.org/Event' === expand(type)) {
                return 'event';
              }
            }
            for (_q = 0, _len8 = typesArray.length; _q < _len8; _q++) {
              type = typesArray[_q];
              if ('http://dbpedia.org/ontology/Event' === expand(type)) {
                return 'event';
              }
            }
            for (_r = 0, _len9 = typesArray.length; _r < _len9; _r++) {
              type = typesArray[_r];
              if ('http://rdf.freebase.com/ns/music.artist' === expand(type)) {
                return 'music';
              }
            }
            for (_s = 0, _len10 = typesArray.length; _s < _len10; _s++) {
              type = typesArray[_s];
              if ('http://schema.org/MusicAlbum' === expand(type)) {
                return 'music';
              }
            }
            for (_t = 0, _len11 = typesArray.length; _t < _len11; _t++) {
              type = typesArray[_t];
              if ('http://www.opengis.net/gml/_Feature' === expand(type)) {
                return 'place';
              }
            }
            return 'thing';
          };
          createEntity = function(item, language) {
            var entity, id, sameAs, thumbnails, types;
            id = get('@id', item);
            types = get('@type', item);
            sameAs = get('http://www.w3.org/2002/07/owl#sameAs', item);
            sameAs = angular.isArray(sameAs) ? sameAs : [sameAs];
            thumbnails = get(['http://xmlns.com/foaf/0.1/depiction', 'http://rdf.freebase.com/ns/common.topic.image', 'http://schema.org/image'], item, function(values) {
              var match, value, _i, _len, _results;
              values = angular.isArray(values) ? values : [values];
              _results = [];
              for (_i = 0, _len = values.length; _i < _len; _i++) {
                value = values[_i];
                match = /m\.(.*)$/i.exec(value);
                if (null === match) {
                  _results.push(value);
                } else {
                  _results.push("https://usercontent.googleapis.com/freebase/v1/image/m/" + match[1] + "?maxwidth=4096&maxheight=4096");
                }
              }
              return _results;
            });
            entity = {
              id: id,
              thumbnail: 0 < thumbnails.length ? thumbnails[0] : null,
              thumbnails: thumbnails,
              type: getKnownType(types),
              types: types,
              label: getLanguage('http://www.w3.org/2000/01/rdf-schema#label', item, language),
              labels: get('http://www.w3.org/2000/01/rdf-schema#label', item),
              sameAs: sameAs,
              source: id.match('^http://rdf.freebase.com/.*$') ? 'freebase' : id.match('^http://dbpedia.org/.*$') ? 'dbpedia' : 'wordlift',
              _item: item
            };
            entity.description = getLanguage(['http://www.w3.org/2000/01/rdf-schema#comment', 'http://rdf.freebase.com/ns/common.topic.description', 'http://schema.org/description'], item, language);
            entity.descriptions = get(['http://www.w3.org/2000/01/rdf-schema#comment', 'http://rdf.freebase.com/ns/common.topic.description', 'http://schema.org/description'], item);
            if (entity.description == null) {
              entity.description = '';
            }
            entity.latitude = get('http://www.w3.org/2003/01/geo/wgs84_pos#lat', item);
            entity.longitude = get('http://www.w3.org/2003/01/geo/wgs84_pos#long', item);
            return entity;
          };
          createEntityAnnotation = function(item) {
            var annotations, entity, entityAnnotation, id, reference, relation, relations, textAnnotation, _i, _len;
            reference = get('http://fise.iks-project.eu/ontology/entity-reference', item);
            entity = entities[reference];
            if (entity == null) {
              return null;
            }
            annotations = [];
            id = get('@id', item);
            relations = get('http://purl.org/dc/terms/relation', item);
            relations = angular.isArray(relations) ? relations : [relations];
            for (_i = 0, _len = relations.length; _i < _len; _i++) {
              relation = relations[_i];
              textAnnotation = textAnnotations[relation];
              entityAnnotation = {
                id: id,
                label: get('http://fise.iks-project.eu/ontology/entity-label', item),
                confidence: get('http://fise.iks-project.eu/ontology/confidence', item),
                entity: entity,
                relation: textAnnotation,
                _item: item,
                selected: false
              };
              if (textAnnotation != null) {
                textAnnotation.entityAnnotations[entityAnnotation.id] = entityAnnotation;
              }
              annotations.push(entityAnnotation);
            }
            return annotations[0];
          };
          createTextAnnotation = function(item) {
            var textAnnotation;
            textAnnotation = {
              id: get('@id', item),
              selectedText: get('http://fise.iks-project.eu/ontology/selected-text', item)['@value'],
              selectionPrefix: get('http://fise.iks-project.eu/ontology/selection-prefix', item)['@value'],
              selectionSuffix: get('http://fise.iks-project.eu/ontology/selection-suffix', item)['@value'],
              start: get('http://fise.iks-project.eu/ontology/start', item),
              end: get('http://fise.iks-project.eu/ontology/end', item),
              confidence: get('http://fise.iks-project.eu/ontology/confidence', item),
              entityAnnotations: {},
              _item: item
            };
            return textAnnotation;
          };
          createLanguage = function(item) {
            return {
              code: get('http://purl.org/dc/terms/language', item),
              confidence: get('http://fise.iks-project.eu/ontology/confidence', item),
              _item: item
            };
          };
          get = function(what, container, filter) {
            var add, key, values, _i, _len;
            if (!angular.isArray(what)) {
              return getA(what, container, filter);
            }
            values = [];
            for (_i = 0, _len = what.length; _i < _len; _i++) {
              key = what[_i];
              add = getA(key, container, filter);
              add = angular.isArray(add) ? add : [add];
              mergeUnique(values, add);
            }
            return values;
          };
          getA = function(what, container, filter) {
            var key, value, whatExp;
            if (filter == null) {
              filter = function(a) {
                return a;
              };
            }
            whatExp = expand(what);
            for (key in container) {
              value = container[key];
              if (whatExp === expand(key)) {
                return filter(value);
              }
            }
            return [];
          };
          getLanguage = function(what, container, language) {
            var item, items, _i, _len;
            if (null === (items = get(what, container))) {
              return;
            }
            items = angular.isArray(items) ? items : [items];
            for (_i = 0, _len = items.length; _i < _len; _i++) {
              item = items[_i];
              if (language === item['@language']) {
                return item['@value'];
              }
            }
            return null;
          };
          containsOrEquals = function(what, where) {
            var item, whatExp, whereArray, _i, _j, _len, _len1;
            if (where == null) {
              return false;
            }
            whereArray = angular.isArray(where) ? where : [where];
            whatExp = expand(what);
            if ('@' === what.charAt(0)) {
              for (_i = 0, _len = whereArray.length; _i < _len; _i++) {
                item = whereArray[_i];
                if (whatExp === expand(item)) {
                  return true;
                }
              }
            } else {
              for (_j = 0, _len1 = whereArray.length; _j < _len1; _j++) {
                item = whereArray[_j];
                if (whatExp === expand(item)) {
                  return true;
                }
              }
            }
            return false;
          };
          mergeUnique = function(array1, array2) {
            var item, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = array2.length; _i < _len; _i++) {
              item = array2[_i];
              if (__indexOf.call(array1, item) < 0) {
                _results.push(array1.push(item));
              }
            }
            return _results;
          };
          mergeEntities = function(entity, entities) {
            var existing, sameAs, _i, _len, _ref;
            _ref = entity.sameAs;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              sameAs = _ref[_i];
              if ((entities[sameAs] != null) && entities[sameAs] !== entity) {
                existing = entities[sameAs];
                mergeUnique(entity.sameAs, existing.sameAs);
                mergeUnique(entity.thumbnails, existing.thumbnails);
                entity.source += ", " + existing.source;
                if ('dbpedia' === existing.source) {
                  entity.description = existing.description;
                }
                if ('dbpedia' === existing.source && (existing.longitude != null)) {
                  entity.longitude = existing.longitude;
                }
                if ('dbpedia' === existing.source && (existing.latitude != null)) {
                  entity.latitude = existing.latitude;
                }
                entities[sameAs] = entity;
                mergeEntities(entity, entities);
              }
            }
            return entity;
          };
          expand = function(content) {
            var matches, path, prefix, prepend;
            if (null === (matches = content.match(/([\w|\d]+):(.*)/))) {
              prefix = content;
              path = '';
            } else {
              prefix = matches[1];
              path = matches[2];
            }
            if (context[prefix] != null) {
              prepend = angular.isString(context[prefix]) ? context[prefix] : context[prefix]['@id'];
            } else {
              prepend = prefix + ':';
            }
            return prepend + path;
          };
          if (!((data[CONTEXT] != null) && (data[GRAPH] != null))) {
            $rootScope.$broadcast('error', 'The analysis response is invalid. Please try again later.');
            return false;
          }
          context = data[CONTEXT];
          graph = data[GRAPH];
          for (_i = 0, _len = graph.length; _i < _len; _i++) {
            item = graph[_i];
            id = item['@id'];
            types = item['@type'];
            dctype = get('http://purl.org/dc/terms/type', item);
            if (containsOrEquals('http://fise.iks-project.eu/ontology/TextAnnotation', types) && containsOrEquals('http://purl.org/dc/terms/LinguisticSystem', dctype)) {
              languages.push(createLanguage(item));
            } else if (containsOrEquals('http://fise.iks-project.eu/ontology/TextAnnotation', types)) {
              textAnnotations[id] = item;
            } else if (containsOrEquals('http://fise.iks-project.eu/ontology/EntityAnnotation', types)) {
              entityAnnotations[id] = item;
            } else {
              entities[id] = item;
            }
          }
          languages.sort(function(a, b) {
            if (a.confidence < b.confidence) {
              return -1;
            }
            if (a.confidence > b.confidence) {
              return 1;
            }
            return 0;
          });
          language = languages[0].code;
          for (id in entities) {
            item = entities[id];
            entities[id] = createEntity(item, language);
          }
          if (merge) {
            for (id in entities) {
              entity = entities[id];
              mergeEntities(entity, entities);
            }
          }
          for (id in textAnnotations) {
            item = textAnnotations[id];
            textAnnotations[id] = createTextAnnotation(item);
          }
          for (id in entityAnnotations) {
            item = entityAnnotations[id];
            entityAnnotations[id] = createEntityAnnotation(item);
          }
          if (merge) {
            for (textAnnotationId in textAnnotations) {
              textAnnotation = textAnnotations[textAnnotationId];
              _ref = textAnnotation.entityAnnotations;
              for (id in _ref) {
                entityAnnotation = _ref[id];
                _ref1 = textAnnotation.entityAnnotations;
                for (anotherId in _ref1) {
                  anotherEntityAnnotation = _ref1[anotherId];
                  if (id !== anotherId && entityAnnotation.entity === anotherEntityAnnotation.entity) {
                    delete textAnnotation.entityAnnotations[anotherId];
                  }
                }
              }
            }
          }
          return {
            language: language,
            entities: entities,
            entityAnnotations: entityAnnotations,
            textAnnotations: textAnnotations,
            languages: languages
          };
        }
      };
      return service;
    }
  ]);

  angular.module('wordlift.tinymce.plugin.services.EditorService', ['wordlift.tinymce.plugin.config', 'AnalysisService']).service('EditorService', [
    'AnalysisService', '$rootScope', '$log', function(AnalysisService, $rootScope, $log) {
      var service;
      service = {
        embedAnalysis: function(analysis) {
          var element, end, entities, entity, entityAnnotation, findEntityAnnotation, findTextAnnotation, html, id, isDirty, match, start, text, textAnnotation, textAnnotationId, traslator, _i, _len, _ref, _ref1;
          findTextAnnotation = function(textAnnotations, start, end) {
            var id, textAnnotation, _ref;
            _ref = analysis.textAnnotations;
            for (id in _ref) {
              textAnnotation = _ref[id];
              if (textAnnotation.start === start && textAnnotation.end === end) {
                return textAnnotation;
              }
            }
            return null;
          };
          findEntityAnnotation = function(entityAnnotations, filter) {
            var entityAnnotation, id, _ref;
            if (filter.uri != null) {
              for (id in entityAnnotations) {
                entityAnnotation = entityAnnotations[id];
                if (filter.uri === entityAnnotation.entity.id || (_ref = filter.uri, __indexOf.call(entityAnnotation.entity.sameAs, _ref) >= 0)) {
                  return entityAnnotation;
                }
              }
              return null;
            }
            if (filter.selected != null) {
              for (id in entityAnnotations) {
                entityAnnotation = entityAnnotations[id];
                if (entityAnnotation.selected) {
                  return entityAnnotation;
                }
              }
              return null;
            }
            return null;
          };
          html = tinyMCE.get('content').getContent({
            format: 'raw'
          });
          entities = this.findEntities(html);
          html = html.replace(/<(\w+)[^>]*\sclass="textannotation[^"]*"[^>]*>([^<]+)<\/\1>/gim, '$2');
          traslator = Traslator.create(html);
          for (_i = 0, _len = entities.length; _i < _len; _i++) {
            match = entities[_i];
            textAnnotation = findTextAnnotation(analysis.textAnnotations, match.text.start, match.text.end);
            if (textAnnotation) {
              entityAnnotation = findEntityAnnotation(textAnnotation.entityAnnotations, {
                uri: match.uri
              });
              if (entityAnnotation != null) {
                entityAnnotation.selected = true;
              }
              console.log("match [ id :: " + textAnnotation.id + " ][ start :: " + textAnnotation.start + " ][ end :: " + textAnnotation.end + " ][ label :: " + match.label + " ]");
            } else {
              console.log("no match [ start :: " + match.text.start + " ][ end :: " + match.text.end + " ][ label :: " + match.label + " ]");
            }
          }
          _ref = analysis.textAnnotations;
          for (id in _ref) {
            textAnnotation = _ref[id];
            start = textAnnotation.start;
            end = textAnnotation.end;
            text = textAnnotation.selectedText;
            console.log("textAnnotation [ start :: " + start + " ][ end :: " + end + " ][ text :: " + text + " ]");
          }
          _ref1 = analysis.textAnnotations;
          for (textAnnotationId in _ref1) {
            textAnnotation = _ref1[textAnnotationId];
            if (0 === Object.keys(textAnnotation.entityAnnotations).length) {
              continue;
            }
            entityAnnotation = findEntityAnnotation(textAnnotation.entityAnnotations, {
              selected: true
            });
            if (entityAnnotation != null) {
              entity = entityAnnotation.entity;
              element = "<span class=\"textannotation highlight " + entity.type + "\" id=\"" + textAnnotationId + "\" itemid=\"" + entity.id + "\">";
            } else {
              element = "<span class=\"textannotation\" id=\"" + textAnnotationId + "\">";
            }
            traslator.insertHtml(element, {
              text: textAnnotation.start
            });
            traslator.insertHtml('</span>', {
              text: textAnnotation.end
            });
          }
          isDirty = tinyMCE.get('content').isDirty();
          tinyMCE.get('content').setContent(traslator.getHtml());
          if (!isDirty) {
            return tinyMCE.get('content').isNotDirty = 1;
          }
        },
        findEntities: function(html) {
          var end, label, match, pattern, start, traslator, uri, _results;
          traslator = Traslator.create(html);
          pattern = /<(\w+)[^>]*\sitemid="([^"]+)"[^>]*>([^<]+)<\/\1>/gim;
          _results = [];
          while (match = pattern.exec(html)) {
            start = match.index;
            end = start + match[0].length;
            uri = match[2];
            label = match[3];
            _results.push({
              html: {
                start: start,
                end: end
              },
              text: {
                start: traslator.html2text(start),
                end: traslator.html2text(end)
              },
              uri: uri,
              label: label
            });
          }
          return _results;
        },
        analyze: function(content) {
          var html, match, pattern;
          if (AnalysisService.isRunning) {
            return AnalysisService.abort();
          } else {
            $('.mce_wordlift').addClass('running');
            tinyMCE.get('content').getBody().setAttribute('contenteditable', false);
            html = tinyMCE.get('content').getContent({
              format: 'raw'
            });
            pattern = /\sitemid="([^"]+)"/gim;
            while (match = pattern.exec(html)) {
              console.log(match);
            }
            return AnalysisService.analyze(content, true);
          }
        },
        getEditor: function() {
          return tinyMCE.get('content');
        },
        getBody: function() {
          return this.getEditor().getBody();
        },
        getDOM: function() {
          return this.getEditor().dom;
        },
        getWinPos: function(elem) {
          var ed, el, left, top;
          ed = this.getEditor();
          el = elem.target;
          top = $('#content_ifr').offset().top - $('body').scrollTop() + el.offsetTop - $(ed.getBody()).scrollTop();
          left = $('#content_ifr').offset().left - $('body').scrollLeft() + el.offsetLeft - $(ed.getBody()).scrollLeft();
          return {
            top: top,
            left: left
          };
        }
      };
      $rootScope.$on('DisambiguationWidget.entitySelected', function(event, obj) {
        var cssClasses, dom, elem, id;
        cssClasses = "textannotation highlight " + obj.entity.type + " disambiguated";
        dom = tinyMCE.get("content").dom;
        id = obj.relation.id;
        elem = dom.get(id);
        dom.setAttrib(id, 'class', cssClasses);
        dom.setAttrib(id, 'itemscope', 'itemscope');
        dom.setAttrib(id, 'itemtype', obj.entity.type);
        return dom.setAttrib(id, 'itemid', obj.entity.id);
      });
      $rootScope.$on('analysisReceived', function(event, analysis) {
        if (analysis != null) {
          service.embedAnalysis(analysis);
        }
        $('.mce_wordlift').removeClass('running');
        return tinyMCE.get('content').getBody().setAttribute('contenteditable', true);
      });
      return service;
    }
  ]);

  angular.module('wordlift.tinymce.plugin.services.EntityService', ['wordlift.tinymce.plugin.config']).service('EntityService', [
    '$log', function($log) {
      var container;
      container = $('#wordlift_selected_entitities_box');
      return {
        select: function(entityAnnotation) {
          var description, entity, entityDiv, id, image, images, label, type, _i, _len;
          $log.info('select');
          $log.info(entityAnnotation);
          entity = entityAnnotation.entity;
          id = entity.id;
          label = entity.label;
          description = entity.description != null ? entity.description : '';
          images = entity.thumbnails;
          type = entity.type;
          entityDiv = $("<div itemid='" + id + "'></div>").append("<input type='text' name='wl_entities[" + id + "][uri]' value='" + id + "'>").append("<input type='text' name='wl_entities[" + id + "][label]' value='" + label + "'>").append("<input type='text' name='wl_entities[" + id + "][description]' value='" + description + "'>").append("<input type='text' name='wl_entities[" + id + "][type]' value='" + type + "'>");
          if (angular.isArray(images)) {
            for (_i = 0, _len = images.length; _i < _len; _i++) {
              image = images[_i];
              entityDiv.append("<input type='text' name='wl_entities[" + id + "][image]' value='" + image + "'>");
            }
          } else {
            entityDiv.append("<input type='text' name='wl_entities[" + id + "][image]' value='" + images + "'>");
          }
          return container.append(entityDiv);
        },
        deselect: function(entityAnnotation) {
          var entity, id;
          $log.info('deselect');
          $log.info(entityAnnotation);
          entity = entityAnnotation.entity;
          id = entity.id;
          return $("div[itemid='" + id + "']").remove();
        }
      };
    }
  ]);

  angular.module('wordlift.tinymce.plugin.services', ['wordlift.tinymce.plugin.config', 'wordlift.tinymce.plugin.services.EditorService', 'AnalysisService', 'wordlift.tinymce.plugin.services.EntityService']);

  angular.module('wordlift.tinymce.plugin.controllers', ['wordlift.tinymce.plugin.config', 'wordlift.tinymce.plugin.services']).filter('orderObjectBy', function() {
    return function(items, field, reverse) {
      var filtered;
      filtered = [];
      angular.forEach(items, function(item) {
        return filtered.push(item);
      });
      filtered.sort(function(a, b) {
        return a[field] > b[field];
      });
      if (reverse) {
        filtered.reverse();
      }
      return filtered;
    };
  }).filter('filterObjectBy', function() {
    return function(items, field, value) {
      var filtered;
      filtered = [];
      angular.forEach(items, function(item) {
        if (item[field] === value) {
          return filtered.push(item);
        }
      });
      return filtered;
    };
  }).controller('EntitiesController', [
    'EditorService', 'EntityService', '$log', '$scope', 'Configuration', function(EditorService, EntityService, $log, $scope, Configuration) {
      var el, scroll, setArrowTop;
      $scope.analysis = null;
      $scope.textAnnotation = null;
      $scope.textAnnotationSpan = null;
      $scope.sortByConfidence = function(entity) {
        return entity[Configuration.entityLabels.confidence];
      };
      $scope.getLabelFor = function(label) {
        return Configuration.entityLabels[label];
      };
      setArrowTop = function(top) {
        return $('head').append('<style>#wordlift-disambiguation-popover .postbox:before,#wordlift-disambiguation-popover .postbox:after{top:' + top + 'px;}</style>');
      };
      el = void 0;
      scroll = function() {
        var pos;
        if (el == null) {
          return;
        }
        pos = EditorService.getWinPos(el);
        return setArrowTop(pos.top - 50);
      };
      $(window).scroll(scroll);
      $('#content_ifr').contents().scroll(scroll);
      $scope.onEntitySelected = function(textAnnotation, entityAnnotation) {
        return $scope.$emit('DisambiguationWidget.entitySelected', entityAnnotation);
      };
      $scope.$on('disambiguatedTextAnnotationDetected', function(event, textAnnotationId, entityId) {
        var entityAnnotation, id, _ref, _results;
        _ref = $scope.analysis.textAnnotations[textAnnotationId].entityAnnotations;
        _results = [];
        for (id in _ref) {
          entityAnnotation = _ref[id];
          if (entityAnnotation.entity.id === entityId) {
            _results.push($scope.analysis.entityAnnotations[entityAnnotation.id].selected = true);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
      $scope.$on('analysisReceived', function(event, analysis) {
        return $scope.analysis = analysis;
      });
      return $scope.$on('textAnnotationClicked', function(event, id, sourceElement) {
        var pos, _ref;
        $scope.textAnnotationSpan = angular.element(sourceElement.target);
        $scope.textAnnotation = $scope.analysis.textAnnotations[id];
        if ((((_ref = $scope.textAnnotation) != null ? _ref.entityAnnotations : void 0) == null) || 0 === Object.keys($scope.textAnnotation.entityAnnotations).length) {
          return $('#wordlift-disambiguation-popover').hide();
        } else {
          pos = EditorService.getWinPos(sourceElement);
          setArrowTop(pos.top - 50);
          return $('#wordlift-disambiguation-popover').show();
        }
      });
    }
  ]).controller('ErrorController', [
    '$element', '$scope', '$log', function($element, $scope, $log) {
      var element;
      element = $($element).dialog({
        title: 'WordLift',
        dialogClass: 'wp-dialog',
        modal: true,
        autoOpen: false,
        closeOnEscape: true,
        buttons: {
          Ok: function() {
            return $(this).dialog('close');
          }
        }
      });
      return $scope.$on('error', function(event, message) {
        $scope.message = message;
        return element.dialog('open');
      });
    }
  ]);

  $ = jQuery;

  angular.module('wordlift.tinymce.plugin', ['wordlift.tinymce.plugin.controllers', 'wordlift.tinymce.plugin.directives']);

  $(container = $('<div id="wl-app" class="wl-app">\n  <div id="wl-error-controller" class="wl-error-controller" ng-controller="ErrorController">\n    <p ng-bind="message"></p>\n  </div>\n  <div id="wordlift-disambiguation-popover" class="metabox-holder" ng-controller="EntitiesController">\n    <div class="postbox">\n      <div class="handlediv" title="Click to toggle"><br></div>\n      <h3 class="hndle"><span>Semantic Web</span></h3>\n      <div class="inside">\n        <form role="form">\n          <div class="form-group">\n            <div class="ui-widget">\n              <input type="text" class="form-control" id="search" placeholder="search or create">\n            </div>\n          </div>\n\n          <wl-entities on-select="onEntitySelected(textAnnotation, entityAnnotation)" text-annotation="textAnnotation"></wl-entities>\n\n        </form>\n\n        <wl-entity-input-boxes text-annotations="analysis.textAnnotations"></wl-entity-input-boxes>\n      </div>\n    </div>\n  </div>\n</div>').appendTo('form[name=post]'), $('#wordlift-disambiguation-popover').css({
    display: 'none',
    height: $('body').height() - $('#wpadminbar').height() + 32,
    top: $('#wpadminbar').height() - 1,
    right: 0
  }).draggable(), $('#search').autocomplete({
    source: ajaxurl + '?action=wordlift_search',
    minLength: 2,
    select: function(event, ui) {
      console.log(event);
      return console.log(ui);
    }
  }).data("ui-autocomplete")._renderItem = function(ul, item) {
    console.log(ul);
    return $("<li>").append("<li>\n  <div class=\"entity " + item.types + "\">\n    <!-- div class=\"thumbnail\" style=\"background-image: url('')\"></div -->\n    <div class=\"thumbnail empty\"></div>\n    <div class=\"confidence\"></div>\n    <div class=\"label\">" + item.label + "</div>\n    <div class=\"type\"></div>\n    <div class=\"source\"></div>\n  </div>\n</li>").appendTo(ul);
  }, $('#wordlift-disambiguation-popover .handlediv').click(function(e) {
    return $('#wordlift-disambiguation-popover').hide();
  }), injector = angular.bootstrap($('#wl-app'), ['wordlift.tinymce.plugin']), tinymce.PluginManager.add('wordlift', function(editor, url) {
    editor.addButton('wordlift', {
      text: 'WordLift',
      icon: false,
      onclick: function() {
        return injector.invoke([
          'EditorService', '$rootScope', function(EditorService, $rootScope) {
            return $rootScope.$apply(function() {
              var html, text;
              html = tinyMCE.activeEditor.getContent({
                format: 'raw'
              });
              text = Traslator.create(html).getText();
              return EditorService.analyze(text);
            });
          }
        ]);
      }
    });
    return editor.onClick.add(function(editor, e) {
      return injector.invoke([
        '$rootScope', function($rootScope) {
          return $rootScope.$apply(function() {
            return $rootScope.$broadcast('textAnnotationClicked', e.target.id, e);
          });
        }
      ]);
    });
  }));

}).call(this);

//# sourceMappingURL=wordlift.js.map
