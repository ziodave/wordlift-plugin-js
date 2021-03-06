(function() {
  var $, ANALYSIS_EVENT, CONFIGURATION_TYPES_EVENT, CONTENT_EDITABLE, CONTENT_IFRAME, CONTEXT, DBPEDIA, DBPEDIA_ORG, DBPEDIA_ORG_REGEX, DCTERMS, EDITOR_ID, FISE_ONT, FISE_ONT_CONFIDENCE, FISE_ONT_ENTITY_ANNOTATION, FISE_ONT_TEXT_ANNOTATION, FREEBASE, FREEBASE_COM, FREEBASE_NS, FREEBASE_NS_DESCRIPTION, GRAPH, MCE_WORDLIFT, RDFS, RDFS_COMMENT, RDFS_LABEL, RUNNING_CLASS, SCHEMA_ORG, SCHEMA_ORG_DESCRIPTION, TEXT_ANNOTATION, TEXT_HTML_NODE_TYPE, Traslator, VALUE, WGS84_POS, container, injector,
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
      var htmlElem, htmlLength, htmlPost, htmlPre, match, pattern, textLength, textPost, textPre;
      this._htmlPositions = [];
      this._textPositions = [];
      this._text = '';
      this._html = this._html.replace(/&nbsp;/gim, ' ');
      pattern = /([^<]*)(<[^>]*>)([^<]*)/gim;
      textLength = 0;
      htmlLength = 0;
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
        this._text += textPre + textPost;
      }
      if ('' === this._text && '' !== this._html) {
        this._text = new String(this._html);
      }
      if (0 === this._textPositions.length || 0 !== this._textPositions[0]) {
        this._htmlPositions.unshift(0);
        return this._textPositions.unshift(0);
      }
    };

    Traslator.prototype.text2html = function(pos) {
      var htmlPos, i, textPos, _i, _ref;
      htmlPos = 0;
      textPos = 0;
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
      if (pos < this._htmlPositions[0]) {
        return 0;
      }
      htmlPos = 0;
      textPos = 0;
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

  CONTEXT = '@context';

  GRAPH = '@graph';

  VALUE = '@value';

  ANALYSIS_EVENT = 'analysisReceived';

  CONFIGURATION_TYPES_EVENT = 'configurationTypesLoaded';

  RDFS = 'http://www.w3.org/2000/01/rdf-schema#';

  RDFS_LABEL = "" + RDFS + "label";

  RDFS_COMMENT = "" + RDFS + "comment";

  FREEBASE = 'freebase';

  FREEBASE_COM = "http://rdf." + FREEBASE + ".com/";

  FREEBASE_NS = "" + FREEBASE_COM + "ns/";

  FREEBASE_NS_DESCRIPTION = "" + FREEBASE_NS + "common.topic.description";

  SCHEMA_ORG = 'http://schema.org/';

  SCHEMA_ORG_DESCRIPTION = "" + SCHEMA_ORG + "description";

  FISE_ONT = 'http://fise.iks-project.eu/ontology/';

  FISE_ONT_ENTITY_ANNOTATION = "" + FISE_ONT + "EntityAnnotation";

  FISE_ONT_TEXT_ANNOTATION = "" + FISE_ONT + "TextAnnotation";

  FISE_ONT_CONFIDENCE = "" + FISE_ONT + "confidence";

  DCTERMS = 'http://purl.org/dc/terms/';

  DBPEDIA = 'dbpedia';

  DBPEDIA_ORG = "http://" + DBPEDIA + ".org/";

  DBPEDIA_ORG_REGEX = "http://(\\w{2}\\.)?" + DBPEDIA + ".org/";

  WGS84_POS = 'http://www.w3.org/2003/01/geo/wgs84_pos#';

  EDITOR_ID = 'content';

  TEXT_ANNOTATION = 'textannotation';

  CONTENT_IFRAME = '#content_ifr';

  RUNNING_CLASS = 'running';

  MCE_WORDLIFT = '.mce_wordlift, .mce-wordlift button';

  CONTENT_EDITABLE = 'contenteditable';

  TEXT_HTML_NODE_TYPE = 3;

  angular.module('wordlift.tinymce.plugin.config', []);

  angular.module('wordlift.directives.wlEntityProps', []).directive('wlEntityProps', function() {
    return {
      restrict: 'E',
      scope: {
        textAnnotations: '='
      },
      template: "<div class=\"wl-entity-props\" ng-repeat=\"textAnnotation in textAnnotations\">\n  <div ng-repeat=\"ea in textAnnotation.entityAnnotations | filterObjectBy:'selected':true\">\n    <div ng-repeat=\"(k, ps) in ea.entity.props\">\n      <input ng-repeat=\"p in ps\" name=\"wl_props[{{ea.entity.id}}][{{k}}][]\" ng-value=\"p\" type=\"text\" />\n    </div>\n  </div>\n</div>"
    };
  });

  angular.module('wordlift.tinymce.plugin.directives', ['wordlift.directives.wlEntityProps', 'wordlift.tinymce.plugin.controllers']).directive('wlEntities', function() {
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
  }).directive('wlEntity', [
    '$log', '$compile', function($log, $compile) {
      return {
        restrict: 'E',
        scope: {
          entityAnnotation: '=',
          onSelect: '&'
        },
        link: function(scope, element, attrs) {
          var template, _ref, _ref1;
          scope.entity = (_ref = scope.entityAnnotation) != null ? _ref.entity : void 0;
          template = "<div class=\"entity {{entityAnnotation.entity.css}}\" ng-class=\"{selected: true==entityAnnotation.selected}\" ng-click=\"onSelect()\" ng-show=\"entity.label\">\n  <div class=\"thumbnail\" ng-show=\"entity.thumbnail\" title=\"{{entity.id}}\" ng-attr-style=\"background-image: url({{entity.thumbnail}})\"></div>\n  <div class=\"thumbnail empty\" ng-hide=\"entity.thumbnail\" title=\"{{entity.id}}\"></div>\n  <div class=\"confidence\" ng-bind=\"entityAnnotation.confidence\"></div>\n  <div class=\"label\" ng-bind=\"entity.label\"></div>\n  <div class=\"" + ((_ref1 = scope.entity) != null ? _ref1.css : void 0) + "-info url\" entity=\"entity\"></div>\n  <div class=\"type\"></div>\n  <div class=\"source\" ng-class=\"entity.source\" ng-bind=\"entity.source\"></div>\n</div>";
          element.html(template).show();
          return $compile(element.contents())(scope);
        }
      };
    }
  ]).directive('wlEventInfo', [
    '$interpolate', function($interpolate) {
      return {
        restrict: 'C',
        scope: {
          entity: '='
        },
        link: function(scope, element, attrs) {
          var _ref, _ref1, _ref2, _ref3, _ref4;
          scope.startDate = (_ref = scope.entity) != null ? (_ref1 = _ref.props['http://www.w3.org/2002/12/cal#dtstart']) != null ? _ref1[0] : void 0 : void 0;
          scope.endDate = (_ref2 = scope.entity) != null ? (_ref3 = _ref2.props['http://www.w3.org/2002/12/cal#dtend']) != null ? _ref3[0] : void 0 : void 0;
          scope.place = (_ref4 = scope.entity) != null ? _ref4.props['http://www.w3.org/2006/vcard/ns#locality'] : void 0;
          return scope.renderDate = function() {
            console.log(scope.startDate);
            if (scope.startDate === scope.endDate) {
              return scope.startDate;
            }
            return $interpolate('{{startDate}} - {{endDate}}', false, null, true)(scope);
          };
        },
        template: "<span class=\"place\" ng-bind=\"place\"></span> <span class=\"date\" ng-bind=\"renderDate()\" title=\"{{renderDate()}}\"></span>"
      };
    }
  ]).directive('wlEntityInputBoxes', function() {
    return {
      restrict: 'E',
      scope: {
        textAnnotations: '='
      },
      template: "<div class=\"wl-entity-input-boxes\" ng-repeat=\"textAnnotation in textAnnotations\">\n  <div ng-repeat=\"entityAnnotation in textAnnotation.entityAnnotations | filterObjectBy:'selected':true\">\n\n    <input type='text' name='wl_entities[{{entityAnnotation.entity.id}}][uri]' value='{{entityAnnotation.entity.id}}'>\n    <input type='text' name='wl_entities[{{entityAnnotation.entity.id}}][label]' value='{{entityAnnotation.entity.label}}'>\n    <textarea name='wl_entities[{{entityAnnotation.entity.id}}][description]'>{{entityAnnotation.entity.description}}</textarea>\n\n    <input type='text' name='wl_entities[{{entityAnnotation.entity.id}}][main_type]' value='{{entityAnnotation.entity.type}}'>\n\n    <input ng-repeat=\"type in entityAnnotation.entity.types\" type='text'\n    	name='wl_entities[{{entityAnnotation.entity.id}}][type][]' value='{{type}}'>\n\n    <input ng-repeat=\"image in entityAnnotation.entity.thumbnails\" type='text'\n      name='wl_entities[{{entityAnnotation.entity.id}}][image][]' value='{{image}}'>\n    <input ng-repeat=\"sameAs in entityAnnotation.entity.sameAs\" type='text'\n      name='wl_entities[{{entityAnnotation.entity.id}}][sameas][]' value='{{sameAs}}'>\n\n    <input type='text' name='wl_entities[{{entityAnnotation.entity.id}}][latitude]' value='{{entityAnnotation.entity.latitude}}'>\n    <input type='text' name='wl_entities[{{entityAnnotation.entity.id}}][longitude]' value='{{entityAnnotation.entity.longitude}}'>\n\n  </div>\n</div>"
    };
  }).directive('autocomplete', [
    '$compile', '$q', '$log', function($compile, $q, $log) {
      return {
        restrict: "A",
        scope: {
          source: '&',
          onSelect: '&'
        },
        link: function(originalScope, elem, attrs, ctrl) {
          var templateHtml;
          templateHtml = '<wl-entity on-select="select(entityAnnotation)" entity-annotation="entityAnnotation"></wl-entity>';
          return elem.autocomplete({
            source: function(request, response) {
              var locals;
              locals = {
                $viewValue: request.term
              };
              return $q.when(originalScope.source(locals)).then(function(matches) {
                return response(matches);
              });
            },
            minLength: 3,
            open: function() {
              return originalScope.$emit('autocompleteOpened');
            },
            close: function() {
              return originalScope.$emit('autocompleteClosed');
            }
          }).data("ui-autocomplete")._renderItem = function(ul, ea) {
            var compiled, el, scope;
            scope = originalScope.$new();
            scope.entityAnnotation = ea;
            scope.select = function(entityAnnotation) {
              entityAnnotation.confidence = 1.0;
              angular.element(elem).val('');
              angular.element(ul).hide();
              originalScope.$emit('autocompleteClosed');
              return originalScope.onSelect({
                entityAnnotation: entityAnnotation
              });
            };
            originalScope.$on('$destroy', function() {
              return scope.$destroy();
            });
            el = angular.element(templateHtml);
            compiled = $compile(el);
            $("<li>").append(el).appendTo(ul);
            return compiled(scope);
          };
        }
      };
    }
  ]);

  angular.module('AnalysisService', ['wordlift.tinymce.plugin.services.EntityService', 'wordlift.tinymce.plugin.services.Helpers']).service('AnalysisService', [
    'EntityAnnotationService', 'EntityService', 'Helpers', 'TextAnnotationService', '$filter', '$http', '$q', '$rootScope', '$log', function(EntityAnnotationService, EntityService, h, TextAnnotationService, $filter, $http, $q, $rootScope, $log) {
      var service;
      service = {
        _knownTypes: [],
        _entities: {},
        promise: void 0,
        isRunning: false
      };
      service.addEntity = function(entity) {
        return this._entities[entity.id] = entity;
      };
      service.setEntities = function(entities) {
        return this._entities = entities;
      };
      service.setKnownTypes = function(types) {
        this._knownTypes = types;
        $rootScope.$broadcast(CONFIGURATION_TYPES_EVENT, types);
        return this._knownTypes;
      };
      service.getKnownTypes = function() {
        return this._knownTypes;
      };
      service.abort = function() {
        if (this.isRunning && (this.promise != null)) {
          return this.promise.resolve();
        }
      };
      service.addTextAnnotation = function(analysis, textAnnotation) {
        analysis.textAnnotations[textAnnotation.id] = textAnnotation;
        return textAnnotation;
      };
      service.enhance = function(analysis, textAnnotation, entityAnnotation) {
        var ea, entityAnnotations, id, _ref;
        entityAnnotations = EntityAnnotationService.find(textAnnotation.entityAnnotations, {
          uri: entityAnnotation.entity.id
        });
        if (0 === entityAnnotations.length) {
          analysis.entities[entityAnnotation.entity.id] = entityAnnotation.entity;
          _ref = textAnnotation.entityAnnotations;
          for (id in _ref) {
            ea = _ref[id];
            ea.selected = false;
          }
          entityAnnotation.selected = true;
          analysis.entityAnnotations[entityAnnotation.id] = entityAnnotation;
          textAnnotation.entityAnnotations[entityAnnotation.id] = analysis.entityAnnotations[entityAnnotation.id];
          return true;
        }
        return false;
      };
      service.preselect = function(analysis, annotations) {
        var annotation, ea, entities, entityAnnotations, textAnnotation, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = annotations.length; _i < _len; _i++) {
          annotation = annotations[_i];
          textAnnotation = TextAnnotationService.findOrCreate(analysis.textAnnotations, annotation);
          entityAnnotations = EntityAnnotationService.find(textAnnotation.entityAnnotations, {
            uri: annotation.uri
          });
          if (0 < entityAnnotations.length) {
            _results.push(entityAnnotations[0].selected = true);
          } else {
            entities = EntityService.find(analysis.entities, {
              uri: annotation.uri
            });
            if (0 === entities.length) {
              entities = EntityService.find(this._entities, {
                uri: annotation.uri
              });
            }
            if (0 === entities.length) {
              $log.error("Missing entity in window.wordlift.entities collection!");
              $log.info(annotation);
              continue;
            }
            analysis.entities[annotation.uri] = entities[0];
            ea = EntityAnnotationService.create({
              label: annotation.label,
              confidence: 1,
              entity: analysis.entities[annotation.uri],
              relation: analysis.textAnnotations[textAnnotation.id],
              selected: true
            });
            analysis.entityAnnotations[ea.id] = ea;
            _results.push(textAnnotation.entityAnnotations[ea.id] = analysis.entityAnnotations[ea.id]);
          }
        }
        return _results;
      };
      service.analyze = function(content, merge) {
        if (merge == null) {
          merge = false;
        }
        if (service.isRunning) {
          return;
        }
        service.isRunning = true;
        service.promise = $q.defer();
        return $http({
          method: 'post',
          url: ajaxurl + '?action=wordlift_analyze',
          data: content,
          timeout: service.promise.promise
        }).success(function(data) {
          $rootScope.$broadcast(ANALYSIS_EVENT, service.parse(data, merge));
          return service.isRunning = false;
        }).error(function(data, status) {
          service.isRunning = false;
          $rootScope.$broadcast(ANALYSIS_EVENT, void 0);
          if (0 === status) {
            return;
          }
          return $rootScope.$broadcast('error', 'An error occurred while requesting an analysis.');
        });
      };
      service.parse = function(data, merge) {
        var anotherEntityAnnotation, anotherId, context, createLanguage, dctype, entities, entity, entityAnnotation, entityAnnotations, graph, id, item, language, languages, textAnnotation, textAnnotationId, textAnnotations, types, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
        if (merge == null) {
          merge = false;
        }
        languages = [];
        textAnnotations = {};
        entityAnnotations = {};
        entities = {};
        createLanguage = function(item) {
          return {
            code: h.get("" + DCTERMS + "language", item, context),
            confidence: h.get(FISE_ONT_CONFIDENCE, item, context),
            _item: item
          };
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
          dctype = h.get("" + DCTERMS + "type", item, context);
          if (h.containsOrEquals(FISE_ONT_TEXT_ANNOTATION, types, context) && h.containsOrEquals("" + DCTERMS + "LinguisticSystem", dctype, context)) {
            languages.push(createLanguage(item));
          } else if (h.containsOrEquals(FISE_ONT_TEXT_ANNOTATION, types, context)) {
            textAnnotations[id] = item;
          } else if (h.containsOrEquals(FISE_ONT_ENTITY_ANNOTATION, types, context)) {
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
          entities[id] = EntityService.create(item, language, service._knownTypes, context);
        }
        if (merge) {
          for (id in entities) {
            entity = entities[id];
            EntityService.merge(entity, entities);
          }
        }
        if (merge) {
          _ref = this._entities;
          for (id in _ref) {
            entity = _ref[id];
            EntityService.merge(entity, entities);
          }
        }
        for (id in textAnnotations) {
          item = textAnnotations[id];
          textAnnotations[id] = TextAnnotationService.build(item, context);
        }
        for (id in entityAnnotations) {
          item = entityAnnotations[id];
          _ref1 = EntityAnnotationService.build(item, language, entities, textAnnotations, context);
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            entityAnnotation = _ref1[_j];
            entityAnnotations[entityAnnotation.id] = entityAnnotation;
          }
        }
        if (merge) {
          for (textAnnotationId in textAnnotations) {
            textAnnotation = textAnnotations[textAnnotationId];
            _ref2 = textAnnotation.entityAnnotations;
            for (id in _ref2) {
              entityAnnotation = _ref2[id];
              _ref3 = textAnnotation.entityAnnotations;
              for (anotherId in _ref3) {
                anotherEntityAnnotation = _ref3[anotherId];
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
      };
      return service;
    }
  ]);

  angular.module('wordlift.tinymce.plugin.services.EditorService', ['wordlift.tinymce.plugin.config', 'AnalysisService']).service('EditorService', [
    'AnalysisService', 'EntityAnnotationService', 'TextAnnotationService', '$rootScope', '$log', function(AnalysisService, EntityAnnotationService, TextAnnotationService, $rootScope, $log) {
      var editor, findEntities, service, walkback;
      editor = function() {
        return tinyMCE.get(EDITOR_ID);
      };
      findEntities = function(html) {
        var match, pattern, traslator, _results;
        traslator = Traslator.create(html);
        pattern = /<(\w+)[^>]*\sitemid="([^"]+)"[^>]*>([^<]+)<\/\1>/gim;
        _results = [];
        while (match = pattern.exec(html)) {
          _results.push({
            start: traslator.html2text(match.index),
            end: traslator.html2text(match.index + match[0].length),
            uri: match[2],
            label: match[3]
          });
        }
        return _results;
      };
      walkback = function(node, stopAt) {
        if (node.childNodes && node.childNodes.length) {
          while (node && node.childNodes.length > 0) {
            node = node.childNodes[node.childNodes.length - 1];
          }
        } else if (node.previousSibling) {
          node = node.previousSibling;
        } else if (node.parentNode) {
          while (node && !node.previousSibling && node.parentNode) {
            node = node.parentNode;
          }
          if (node === stopAt) {
            return;
          }
          node = node.previousSibling;
        } else {
          return;
        }
        if (node) {
          if (node.nodeType === TEXT_HTML_NODE_TYPE) {
            return node;
          }
          if (node === stopAt) {
            return;
          }
          return walkback(node, stopAt);
        }
      };
      service = {
        createTextAnnotationFromCurrentSelection: function() {
          var ed, end, node, selection, start, text, textAnnotation;
          ed = editor();
          selection = ed.getWin().getSelection();
          text = selection.toString();
          node = selection.anchorNode;
          start = selection.anchorNode.nodeType === TEXT_HTML_NODE_TYPE ? selection.anchorOffset : 0;
          while (node = walkback(node, ed.getBody())) {
            start = start + node.data.length;
          }
          end = start + text.length;
          textAnnotation = TextAnnotationService.create({
            start: start,
            end: end,
            text: text
          });
          if (start === end) {
            $log.warn("Invalid selection! The text annotation cannot be created");
            $log.info(textAnnotation);
            return;
          }
          ed.selection.setContent("<span id=\"" + textAnnotation.id + "\" class=\"" + TEXT_ANNOTATION + "\">" + textAnnotation.text + "</span>");
          return $rootScope.$broadcast('textAnnotationAdded', textAnnotation);
        },
        embedAnalysis: (function(_this) {
          return function(analysis) {
            var ed, element, entities, entity, entityAnnotations, html, isDirty, textAnnotation, textAnnotationId, traslator, _ref;
            ed = editor();
            html = ed.getContent({
              format: 'raw'
            });
            entities = findEntities(html);
            AnalysisService.preselect(analysis, entities);
            while (html.match(/<(\w+)[^>]*\sclass="textannotation[^"]*"[^>]*>([^<]+)<\/\1>/gim, '$2')) {
              html = html.replace(/<(\w+)[^>]*\sclass="textannotation[^"]*"[^>]*>([^<]+)<\/\1>/gim, '$2');
            }
            traslator = Traslator.create(html);
            _ref = analysis.textAnnotations;
            for (textAnnotationId in _ref) {
              textAnnotation = _ref[textAnnotationId];
              if (!(0 < Object.keys(textAnnotation.entityAnnotations).length)) {
                continue;
              }
              element = "<span id=\"" + textAnnotationId + "\" class=\"" + TEXT_ANNOTATION;
              entityAnnotations = EntityAnnotationService.find(textAnnotation.entityAnnotations, {
                selected: true
              });
              if (0 < entityAnnotations.length && (entityAnnotations[0].entity != null)) {
                entity = entityAnnotations[0].entity;
                element += " highlight " + entity.css + "\" itemid=\"" + entity.id;
              }
              element += '">';
              traslator.insertHtml(element, {
                text: textAnnotation.start
              });
              traslator.insertHtml('</span>', {
                text: textAnnotation.end
              });
            }
            isDirty = ed.isDirty();
            ed.setContent(traslator.getHtml(), {
              format: 'raw'
            });
            return ed.isNotDirty = !isDirty;
          };
        })(this),
        analyze: function(content) {
          if (AnalysisService.isRunning) {
            return AnalysisService.abort();
          }
          $(MCE_WORDLIFT).addClass(RUNNING_CLASS);
          editor().getBody().setAttribute(CONTENT_EDITABLE, false);
          return AnalysisService.analyze(content, true);
        },
        getWinPos: function(elem) {
          var ed, el;
          ed = editor();
          el = elem.target;
          return {
            top: $(CONTENT_IFRAME).offset().top - $('body').scrollTop() + el.offsetTop - $(ed.getBody()).scrollTop(),
            left: $(CONTENT_IFRAME).offset().left - $('body').scrollLeft() + el.offsetLeft - $(ed.getBody()).scrollLeft()
          };
        }
      };
      $rootScope.$on('selectEntity', function(event, args) {
        var cls, dom, entity, id, itemid, itemscope;
        dom = editor().dom;
        id = args.ta.id;
        cls = TEXT_ANNOTATION;
        if (args.ea != null) {
          entity = args.ea.entity;
          cls += " highlight " + entity.css;
          itemscope = 'itemscope';
          itemid = entity.id;
          AnalysisService.addEntity(entity);
        } else {
          itemscope = null;
          itemid = null;
        }
        dom.setAttrib(id, 'class', cls);
        dom.setAttrib(id, 'itemscope', itemscope);
        return dom.setAttrib(id, 'itemid', itemid);
      });
      $rootScope.$on(ANALYSIS_EVENT, function(event, analysis) {
        if ((analysis != null) && (analysis.textAnnotations != null)) {
          service.embedAnalysis(analysis);
        }
        $(MCE_WORDLIFT).removeClass(RUNNING_CLASS);
        return editor().getBody().setAttribute(CONTENT_EDITABLE, true);
      });
      return service;
    }
  ]);

  angular.module('wordlift.tinymce.plugin.services.EntityAnnotationService', []).service('EntityAnnotationService', [
    'Helpers', function(h) {
      var service;
      service = {};
      service.create = function(params) {
        var defaults;
        defaults = {
          id: 'uri:local-entity-annotation-' + h.uniqueId(32),
          label: '',
          confidence: 0.0,
          entity: null,
          relation: null,
          selected: false,
          _item: null
        };
        if ((params.entity != null) && (params.entity.label == null)) {
          params.entity.label = params.label;
        }
        return h.merge(defaults, params);
      };

      /**
       * Create an entity annotation. An entity annotation is created for each related text-annotation.
       * @param {object} Entity raw data.
       * @param {string} The language code.
       * @return {array} An array of entity annotations.
       */
      service.build = function(item, language, entities, tas, context) {
        var annotations, entityAnnotation, reference, relation, relations, textAnnotation, _i, _len;
        reference = h.get("" + FISE_ONT + "entity-reference", item, context);
        if (entities[reference] == null) {
          return [];
        }
        annotations = [];
        relations = h.get("" + DCTERMS + "relation", item, context);
        relations = angular.isArray(relations) ? relations : [relations];
        for (_i = 0, _len = relations.length; _i < _len; _i++) {
          relation = relations[_i];
          textAnnotation = tas[relation];
          entityAnnotation = service.create({
            id: h.get('@id', item, context),
            label: h.getLanguage("" + FISE_ONT + "entity-label", item, language, context),
            confidence: h.get(FISE_ONT_CONFIDENCE, item, context),
            entity: entities[reference],
            relation: textAnnotation,
            _item: item
          });
          if (textAnnotation != null) {
            textAnnotation.entityAnnotations[entityAnnotation.id] = entityAnnotation;
          }
          annotations.push(entityAnnotation);
        }
        return annotations;
      };
      service.find = function(entityAnnotations, filter) {
        var entityAnnotation, id;
        if (filter.uri != null) {
          return (function() {
            var _ref, _results;
            _results = [];
            for (id in entityAnnotations) {
              entityAnnotation = entityAnnotations[id];
              if (filter.uri === entityAnnotation.entity.id || (_ref = filter.uri, __indexOf.call(entityAnnotation.entity.sameAs, _ref) >= 0)) {
                _results.push(entityAnnotation);
              }
            }
            return _results;
          })();
        }
        if (filter.selected != null) {
          return (function() {
            var _results;
            _results = [];
            for (id in entityAnnotations) {
              entityAnnotation = entityAnnotations[id];
              if (entityAnnotation.selected === filter.selected) {
                _results.push(entityAnnotation);
              }
            }
            return _results;
          })();
        }
      };
      return service;
    }
  ]);

  angular.module('wordlift.tinymce.plugin.services.EntityService', ['wordlift.tinymce.plugin.services.Helpers']).service('EntityService', [
    'Helpers', '$filter', function(h, $filter) {
      var service;
      service = {};
      service.find = function(entities, filter) {
        var entity, entityId;
        if (filter.uri != null) {
          return (function() {
            var _ref, _results;
            _results = [];
            for (entityId in entities) {
              entity = entities[entityId];
              if (filter.uri === (entity != null ? entity.id : void 0) || (_ref = filter.uri, __indexOf.call(entity != null ? entity.sameAs : void 0, _ref) >= 0)) {
                _results.push(entity);
              }
            }
            return _results;
          })();
        }
      };

      /**
       * Create an entity using the provided data and context.
       * @param {object} An item object containing the entity raw data.
       * @param {object} A context instance with prefix -> URL key-value pairs.
       * @return {object} An entity instance.
       */
      service.create = function(item, language, kt, context) {
        var css, entity, fn, id, knownTypes, sameAs, thumbnails, types;
        id = h.get('@id', item, context);
        types = h.get('@type', item, context, function(ts) {
          var t, _i, _len, _results;
          ts = angular.isArray(ts) ? ts : [ts];
          _results = [];
          for (_i = 0, _len = ts.length; _i < _len; _i++) {
            t = ts[_i];
            _results.push(h.expand(t, context));
          }
          return _results;
        });
        sameAs = h.get('http://www.w3.org/2002/07/owl#sameAs', item, context);
        sameAs = angular.isArray(sameAs) ? sameAs : [sameAs];
        fn = function(values) {
          var match, value, _i, _len, _results;
          values = angular.isArray(values) ? values : [values];
          _results = [];
          for (_i = 0, _len = values.length; _i < _len; _i++) {
            value = values[_i];
            match = /m\.(.*)$/i.exec(value);
            if (null === match) {
              _results.push(value);
            } else {
              _results.push("https://usercontent.googleapis.com/" + FREEBASE + "/v1/image/m/" + match[1] + "?maxwidth=4096&maxheight=4096");
            }
          }
          return _results;
        };
        thumbnails = h.get(['http://xmlns.com/foaf/0.1/depiction', "" + FREEBASE_NS + "common.topic.image", "" + SCHEMA_ORG + "image"], item, context, fn);
        knownTypes = service.getKnownTypes(types, kt, context);
        css = knownTypes[0].type.css;
        entity = {
          id: id,
          thumbnail: 0 < thumbnails.length ? thumbnails[0] : null,
          thumbnails: thumbnails,
          css: css,
          type: knownTypes[0].type.uri,
          types: types,
          label: h.getLanguage(RDFS_LABEL, item, language, context),
          labels: h.get(RDFS_LABEL, item, context),
          sameAs: sameAs,
          source: id.match("^" + FREEBASE_COM + ".*$") ? FREEBASE : id.match("^" + DBPEDIA_ORG_REGEX + ".*$") ? DBPEDIA : 'wordlift',
          _item: item,
          props: service.createProps(item, context)
        };
        entity.sources = [entity.source];
        entity.description = h.getLanguage([RDFS_COMMENT, FREEBASE_NS_DESCRIPTION, SCHEMA_ORG_DESCRIPTION], item, language, context);
        entity.descriptions = h.get([RDFS_COMMENT, FREEBASE_NS_DESCRIPTION, SCHEMA_ORG_DESCRIPTION], item, context);
        if (entity.description == null) {
          entity.description = '';
        }
        entity.latitude = h.get("" + WGS84_POS + "lat", item, context);
        entity.longitude = h.get("" + WGS84_POS + "long", item, context);
        if (0 === entity.latitude.length || 0 === entity.longitude.length) {
          entity.latitude = '';
          entity.longitude = '';
        }
        return entity;
      };
      service.merge = function(entity, entities) {
        var existing, sameAs, _i, _len, _ref;
        _ref = entity.sameAs;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          sameAs = _ref[_i];
          if ((entities[sameAs] != null) && entities[sameAs] !== entity) {
            existing = entities[sameAs];
            h.mergeUnique(entity.sameAs, existing.sameAs);
            h.mergeUnique(entity.thumbnails, existing.thumbnails);
            h.mergeUnique(entity.sources, existing.sources);
            if (entity.css == null) {
              entity.css = existing.css;
            }
            entity.source = entity.sources.join(', ');
            if (DBPEDIA === existing.source) {
              entity.description = existing.description;
            }
            if (DBPEDIA === existing.source && (existing.longitude != null)) {
              entity.longitude = existing.longitude;
            }
            if (DBPEDIA === existing.source && (existing.latitude != null)) {
              entity.latitude = existing.latitude;
            }
            entities[sameAs] = entity;
            service.merge(entity, entities);
          }
        }
        return entity;
      };

      /**
       * Get the known type given the specified types.
       * @param {array} An array of types.
       * @param {object} An object representing the known types.
       * @return {object} The default type.
       */
      service.getKnownTypes = function(types, knownTypes, context) {
        var defaultType, kt, matches, returnTypes, uri, uris, _i, _len;
        returnTypes = [];
        defaultType = void 0;
        for (_i = 0, _len = knownTypes.length; _i < _len; _i++) {
          kt = knownTypes[_i];
          if (__indexOf.call(kt.sameAs, '*') >= 0) {
            defaultType = [
              {
                type: kt
              }
            ];
          }
          uris = kt.sameAs.concat(kt.uri);
          matches = (function() {
            var _j, _len1, _results;
            _results = [];
            for (_j = 0, _len1 = uris.length; _j < _len1; _j++) {
              uri = uris[_j];
              if (h.containsOrEquals(uri, types, context)) {
                _results.push(uri);
              }
            }
            return _results;
          })();
          if (0 < matches.length) {
            returnTypes.push({
              matches: matches,
              type: kt
            });
          }
        }
        if (0 === returnTypes.length) {
          return defaultType;
        }
        $filter('orderBy')(returnTypes, 'matches', true);
        return returnTypes;
      };

      /**
       * Create a key-values pair of properties.
       * @param {object} An item object containing the entity raw data.
       * @param {object} A context instance with prefix -> URL key-value pairs.
       * @return {object} A key-values pair of entity properties.
       */
      service.createProps = function(item, context) {
        var expKey, key, props, value;
        props = {};
        for (key in item) {
          value = item[key];
          if (angular.isObject(value)) {
            continue;
          }
          expKey = h.expand(key, context);
          if (props[expKey] == null) {
            props[expKey] = [];
          }
          props[expKey].push(h.expand(value, context));
        }
        return props;
      };
      return service;
    }
  ]);

  angular.module('wordlift.tinymce.plugin.services.Helpers', []).service('Helpers', [
    function() {
      var service;
      service = {};
      service.merge = function(options, overrides) {
        return this.extend(this.extend({}, options), overrides);
      };
      service.extend = function(object, properties) {
        var key, val;
        for (key in properties) {
          val = properties[key];
          object[key] = val;
        }
        return object;
      };
      service.uniqueId = function(length) {
        var id;
        if (length == null) {
          length = 8;
        }
        id = '';
        while (id.length < length) {
          id += Math.random().toString(36).substr(2);
        }
        return id.substr(0, length);
      };

      /**
       * Expand a string using the provided context.
       * @param {string} A content string to be expanded.
       * @param {object} A context providing prefix -> URL key-value pairs
       * @return {string} An expanded string.
       */
      service._expand = function(content, context) {
        var matches, path, prefix, prepend;
        if (content == null) {
          return;
        }
        if (null === (matches = ("" + content).match(/([\w|\d]+):(.*)/))) {
          prefix = content;
          path = '';
        } else {
          prefix = matches[1];
          path = matches[2];
        }
        if (context[prefix] == null) {
          return content;
        }
        prepend = angular.isString(context[prefix]) ? context[prefix] : context[prefix]['@id'];
        return prepend + path;
      };

      /**
       * Expand the specified content using the prefixes in the provided context.
       * @param {string|array} The content string or an array of strings.
       * @param {object} A context made of prefix -> URLs value pairs.
       * @return {string|array} An expanded string or an array of expanded strings.
       */
      service.expand = function(content, context) {
        var c;
        if (angular.isArray(content)) {
          return (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = content.length; _i < _len; _i++) {
              c = content[_i];
              _results.push(service.expand(c, context));
            }
            return _results;
          })();
        }
        return service._expand(content, context);
      };
      service.get = function(what, container, context, filter) {
        var add, key, values, _i, _len;
        if (!angular.isArray(what)) {
          return service.getA(what, container, context, filter);
        }
        values = [];
        for (_i = 0, _len = what.length; _i < _len; _i++) {
          key = what[_i];
          add = service.getA(key, container, context, filter);
          add = angular.isArray(add) ? add : [add];
          service.mergeUnique(values, add);
        }
        return values;
      };
      service.getA = function(what, container, context, filter) {
        var key, value, whatExp;
        if (filter == null) {
          filter = (function(a) {
            return a;
          });
        }
        whatExp = service.expand(what, context);
        for (key in container) {
          value = container[key];
          if (whatExp === service.expand(key, context)) {
            return filter(value);
          }
        }
        return [];
      };
      service.getLanguage = function(what, container, language, context) {
        var item, items, _i, _j, _len, _len1;
        if (null === (items = service.get(what, container, context))) {
          return;
        }
        items = angular.isArray(items) ? items : [items];
        for (_i = 0, _len = items.length; _i < _len; _i++) {
          item = items[_i];
          if (language === item['@language']) {
            return item[VALUE];
          }
        }
        for (_j = 0, _len1 = items.length; _j < _len1; _j++) {
          item = items[_j];
          if ('en' === item['@language']) {
            return item[VALUE];
          }
        }
      };
      service.mergeUnique = function(array1, array2) {
        var item, _i, _len, _results;
        if (array1 == null) {
          array1 = [];
        }
        _results = [];
        for (_i = 0, _len = array2.length; _i < _len; _i++) {
          item = array2[_i];
          if (__indexOf.call(array1, item) < 0) {
            _results.push(array1.push(item));
          }
        }
        return _results;
      };
      service.containsOrEquals = function(what, where, context) {
        var item, whatExp, whereArray, _i, _len;
        if (where == null) {
          return false;
        }
        whereArray = angular.isArray(where) ? where : [where];
        whatExp = service.expand(what, context);
        for (_i = 0, _len = whereArray.length; _i < _len; _i++) {
          item = whereArray[_i];
          if (whatExp === service.expand(item, context)) {
            return true;
          }
        }
        return false;
      };
      return service;
    }
  ]);

  angular.module('wordlift.tinymce.plugin.services.TextAnnotationService', []).service('TextAnnotationService', [
    'Helpers', function(h) {
      var service;
      service = {};

      /**
       * Create a text annotation using the specified parameters.
       * @param {object} An object containing the parameters to set.
       * @return {object} A text annotation instance.
       */
      service.create = function(params) {
        var defaults;
        if (params == null) {
          params = {};
        }
        defaults = {
          id: 'urn:local-text-annotation-' + h.uniqueId(32),
          text: '',
          start: 0,
          end: 0,
          confidence: 0.0,
          entityAnnotations: {},
          _item: null
        };
        return h.merge(defaults, params);
      };

      /**
       * Create a text annotation.
       * @param {object} The text annotation raw data.
       * @param {object} The context data holding prefix -> URL key-value pairs.
       * @return {object} A text annotation.
       */
      service.build = function(item, context) {
        return service.create({
          id: h.get('@id', item, context),
          text: h.get("" + FISE_ONT + "selected-text", item, context)[VALUE],
          start: h.get("" + FISE_ONT + "start", item, context),
          end: h.get("" + FISE_ONT + "end", item, context),
          confidence: h.get(FISE_ONT_CONFIDENCE, item, context),
          entityAnnotations: {},
          _item: item
        });
      };
      service.find = function(textAnnotations, start, end) {
        var textAnnotation, textAnnotationId;
        for (textAnnotationId in textAnnotations) {
          textAnnotation = textAnnotations[textAnnotationId];
          if (textAnnotation.start === start && textAnnotation.end === end) {
            return textAnnotation;
          }
        }
      };

      /**
       * Find a text annotation in the provided collection which matches the start and end values.
       * @param {object} A collection of text annotations.
       * @param {object} Text annotation used for search or to create a new text annotation.
       * @return {object} The text annotation matching the parameters or a new text annotation with those parameters.
       */
      service.findOrCreate = function(textAnnotations, textAnnotation) {
        var ta;
        ta = service.find(textAnnotations, textAnnotation.start, textAnnotation.end);
        if (ta != null) {
          return ta;
        }
        ta = service.create({
          text: textAnnotation.label,
          start: textAnnotation.start,
          end: textAnnotation.end,
          confidence: 1.0
        });
        textAnnotations[ta.id] = ta;
        return ta;
      };
      return service;
    }
  ]);

  angular.module('wordlift.tinymce.plugin.services', ['wordlift.tinymce.plugin.config', 'wordlift.tinymce.plugin.services.EditorService', 'wordlift.tinymce.plugin.services.EntityService', 'wordlift.tinymce.plugin.services.EntityAnnotationService', 'wordlift.tinymce.plugin.services.TextAnnotationService', 'wordlift.tinymce.plugin.services.Helpers', 'AnalysisService']);

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
    'AnalysisService', 'EntityAnnotationService', 'EditorService', '$http', '$log', '$scope', '$rootScope', function(AnalysisService, EntityAnnotationService, EditorService, $http, $log, $scope, $rootScope) {
      var el, scroll, setArrowTop;
      $scope.isRunning = false;
      $scope.analysis = null;
      $scope.textAnnotation = null;
      $scope.textAnnotationSpan = null;
      $scope.newEntity = {
        label: null,
        type: null
      };
      $scope.activeToolbarTab = 'Search for entities';
      $scope.isActiveToolbarTab = function(tab) {
        return $scope.activeToolbarTab === tab;
      };
      $scope.setActiveToolbarTab = function(tab) {
        if ($scope.activeToolbarTab === tab) {
          return;
        }
        $scope.autocompleteOpened = false;
        return $scope.activeToolbarTab = tab;
      };
      $scope.autocompleteOpened = false;
      $scope.knownTypes = null;
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
      $scope.onSearch = function(term) {
        return $http({
          method: 'post',
          url: ajaxurl + '?action=wordlift_search',
          data: {
            'term': term
          }
        }).then(function(response) {
          return response.data.map(function(entity) {
            return EntityAnnotationService.create({
              'entity': entity
            });
          });
        });
      };
      $scope.onNewEntityCreate = function(entity) {
        $scope.isRunning = true;
        return $http({
          method: 'post',
          url: ajaxurl + '?action=wordlift_add_entity',
          data: $scope.newEntity
        }).success(function(data, status, headers, config) {
          var entityAnnotation;
          $scope.isRunning = false;
          entityAnnotation = EntityAnnotationService.create({
            'entity': data
          });
          entityAnnotation.confidence = 1.0;
          if (AnalysisService.enhance($scope.analysis, $scope.textAnnotation, entityAnnotation) === true) {
            return $scope.$emit('selectEntity', {
              ta: $scope.textAnnotation,
              ea: entityAnnotation
            });
          }
        }).error(function(data, status, headers, config) {
          $scope.isRunning = false;
          return $log.debug("Got en error on onNewEntityCreate");
        });
      };
      $scope.onSearchedEntitySelected = function(entityAnnotation) {
        if (AnalysisService.enhance($scope.analysis, $scope.textAnnotation, entityAnnotation) === true) {
          return $scope.$emit('selectEntity', {
            ta: $scope.textAnnotation,
            ea: entityAnnotation
          });
        }
      };
      $scope.onEntitySelected = function(textAnnotation, entityAnnotation) {
        return $scope.$emit('selectEntity', {
          ta: textAnnotation,
          ea: entityAnnotation
        });
      };
      $scope.$on('analysisReceived', function(event, analysis) {
        return $scope.analysis = analysis;
      });
      $scope.$on('autocompleteOpened', function(event) {
        return $scope.autocompleteOpened = true;
      });
      $scope.$on('autocompleteClosed', function(event) {
        return $scope.autocompleteOpened = false;
      });
      $scope.$on('configurationTypesLoaded', function(event, types) {
        return $scope.knownTypes = types;
      });
      $scope.$on('textAnnotationAdded', function(event, textAnnotation) {
        if (!$scope.analysis) {
          $rootScope.$broadcast('error', 'You must analyze the document before adding new entity ...');
          return;
        }
        return $scope.textAnnotation = AnalysisService.addTextAnnotation($scope.analysis, textAnnotation);
      });
      return $scope.$on('textAnnotationClicked', function(event, id, sourceElement) {
        var pos, _ref, _ref1, _ref2;
        $scope.textAnnotation = (_ref = $scope.analysis) != null ? _ref.textAnnotations[id] : void 0;
        $scope.newEntity.label = (_ref1 = $scope.textAnnotation) != null ? _ref1.text : void 0;
        if (((_ref2 = $scope.textAnnotation) != null ? _ref2.entityAnnotations : void 0) == null) {
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

  $(container = $('<div id="wl-app" class="wl-app">\n  <div id="wl-error-controller" class="wl-error-controller" ng-controller="ErrorController">\n    <p ng-bind="message"></p>\n  </div>\n  <div id="wordlift-disambiguation-popover" class="metabox-holder" ng-controller="EntitiesController">\n    <div class="postbox">\n      <div class="handlediv" title="Click to toggle"><br></div>\n      <h3 class="hndle"><span>Semantic Web</span></h3>\n      <div class="ui-widget toolbar">\n        <span class="wl-active-tab" ng-bind="activeToolbarTab" />\n        <i ng-class="{\'selected\' : isActiveToolbarTab(\'Search for entities\')}" ng-click="setActiveToolbarTab(\'Search for entities\')" class="wl-search-toolbar-icon" />\n        <i ng-class="{\'selected\' : isActiveToolbarTab(\'Add new entity\')}" ng-click="setActiveToolbarTab(\'Add new entity\')" class="wl-add-entity-toolbar-icon" />\n      </div>\n      <div class="inside">\n        <form role="form">\n          <div class="form-group">\n            <div ng-show="isActiveToolbarTab(\'Search for entities\')" class="tab">\n              <div class="ui-widget">\n                <input type="text" class="form-control" id="search" placeholder="search for entities" autocomplete on-select="onSearchedEntitySelected(entityAnnotation)" source="onSearch($viewValue)">\n              </div>       \n            </div>\n            <div ng-show="isActiveToolbarTab(\'Add new entity\')" class="tab">\n              <div class="ui-widget">\n                <input ng-model="newEntity.label" type="text" class="form-control" id="label" placeholder="label">\n              </div>\n              <div class="ui-widget">\n                <select ng-model="newEntity.type" ng-options="type.uri as type.label for type in knownTypes" placeholder="type">\n                  <option value="" disabled selected>Select the entity type</option>\n                </select>\n              </div>\n              <div class="ui-widget right">\n                <i class="wl-spinner" ng-show="isRunning"></i>\n                <button ng-click="onNewEntityCreate(newEntity)">Save the entity</button>\n              </div>\n            </div>\n          </div>\n          <div id="wl-entities-wrapper" ng-hide="autocompleteOpened">\n            <wl-entities on-select="onEntitySelected(textAnnotation, entityAnnotation)" text-annotation="textAnnotation"></wl-entities>\n          </div>\n        </form>\n        \n        <wl-entity-input-boxes text-annotations="analysis.textAnnotations"></wl-entity-input-boxes>\n        <wl-entity-props text-annotations="analysis.textAnnotations"></wl-entity-props>\n      </div>\n    </div>\n  </div>\n</div>').appendTo('form[name=post]'), $('#wordlift-disambiguation-popover').css({
    display: 'none',
    height: $('body').height() - $('#wpadminbar').height() + 12,
    top: $('#wpadminbar').height() - 1,
    right: 20
  }).draggable(), $('#wordlift-disambiguation-popover .handlediv').click(function(e) {
    return $('#wordlift-disambiguation-popover').hide();
  }), injector = angular.bootstrap($('#wl-app'), ['wordlift.tinymce.plugin']), injector.invoke([
    'AnalysisService', function(AnalysisService) {
      if (window.wordlift != null) {
        AnalysisService.setKnownTypes(window.wordlift.types);
        return AnalysisService.setEntities(window.wordlift.entities);
      }
    }
  ]), tinymce.PluginManager.add('wordlift', function(editor, url) {
    editor.addButton('wordlift_add_entity', {
      classes: 'widget btn wordlift_add_entity',
      text: '',
      tooltip: 'Click to refer an entity to the selected text',
      onclick: function() {
        return injector.invoke([
          'EditorService', '$rootScope', function(EditorService, $rootScope) {
            return $rootScope.$apply(function() {
              return EditorService.createTextAnnotationFromCurrentSelection();
            });
          }
        ]);
      }
    });
    editor.addButton('wordlift', {
      classes: 'widget btn wordlift',
      text: '',
      tooltip: 'Click to analyze the content',
      onclick: function() {
        return injector.invoke([
          'EditorService', '$rootScope', '$log', function(EditorService, $rootScope, $log) {
            return $rootScope.$apply(function() {
              var html, text;
              html = editor.getContent({
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
