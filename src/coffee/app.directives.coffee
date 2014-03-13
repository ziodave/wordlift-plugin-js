angular.module('wordlift.tinymce.plugin.directives', ['wordlift.tinymce.plugin.controllers'])
.directive('wlMetaBoxSelectedEntity', ->
    restrict: 'AE'
    scope:
      index: '='
      entity: '='
    template: """
      <span>{{entity.label}} (<small>{{entity.type}}</span>)\n
      <br /><small>{{entity.thumbnail}}</small>
      <input type="hidden" name="entities[{{index}}]['id']" value="{{entity.id}}" />\n
      <input type="hidden" name="entities[{{index}}]['label']" value="{{entity.label}}" />\n
      <input type="hidden" name="entities[{{index}}]['description']" value="{{entity.description}}" />\n
      <input type="hidden" name="entities[{{index}}]['type']" value="{{entity.type}}" />\n
      <input type="hidden" name="entities[{{index}}]['thumbnail']" value="{{entity.thumbnail}}" />\n
    """
  )
# The wlEntities directive provides a UI for disambiguating the entities for a provided text annotation.
.directive('wlEntities', ->
    # Restrict the directive to elements only (<wl-entities text-annotation="..."></wl-entities>)
    restrict: 'E'
    # Create a separate scope
    scope:
    # Get the text annotation from the text-annotation attribute.
      textAnnotation: '='
    # Create the link function in order to bind to children elements events.
    link: (scope, element, attrs) ->
      scope.select = (item) ->

        # Set the selected flag on each annotation.
        for id, entityAnnotation of scope.textAnnotation.entityAnnotations
          # The selected flag is set to false for each annotation which is not the selected one.
          # For the selected one is set to true only if the entity is not selected already, otherwise it is deselected.
          entityAnnotation.selected = item.id is entityAnnotation.id && !entityAnnotation.selected

    template: """
      <div>
        <ul>
          <li ng-repeat="entityAnnotation in textAnnotation.entityAnnotations | orderObjectBy:'confidence':true">
            <wl-entity select="select(entityAnnotation)" entity-annotation="entityAnnotation"></wl-entity>
          </li>
        </ul>
      </div>
    """
  )
# The wlEntity directive shows a tile for a provided entityAnnotation. When a tile is clicked the function provided
# in the select attribute is called.
.directive('wlEntity', ->
    restrict: 'E'
    scope:
      entityAnnotation: '='
      select: '&'
    template: """
      <div class="entity {{entityAnnotation.entity.type}}" ng-class="{selected: true==entityAnnotation.selected}" ng-click="select()" ng-show="entityAnnotation.entity.label">
        <div class="thumbnail" ng-show="entityAnnotation.entity.thumbnail" title="{{entityAnnotation.entity.id}}" ng-attr-style="background-image: url({{entityAnnotation.entity.thumbnail}})"></div>
        <div class="thumbnail empty" ng-hide="entityAnnotation.entity.thumbnail" title="{{entityAnnotation.entity.id}}"></div>
        <div class="confidence" ng-bind="entityAnnotation.confidence"></div>
        <div class="label" ng-bind="entityAnnotation.entity.label"></div>
        <div class="type"></div>
        <div class="source" ng-class="entityAnnotation.entity.source" ng-bind="entityAnnotation.entity.source"></div>
      </div>
    """
  )

