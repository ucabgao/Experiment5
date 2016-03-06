import Ember from 'ember';
import Utils from 'ember-rapid-forms/utils/utils';
import layout from '../templates/components/em-form';

/*
Form View

A component for rendering a form element.

Syntax:
{{em-form
    //The layout of the form
    form_layout="form|inline|horizontal"
    //The model bound to the form if any
    model="some_model_instance"
    //The action to be invoked on the controller when a form is submitted.
    action="some_action"
    //if true a submit button will be rendered
    submitButton=true|false
    //if true validation icons will be rendered
    validationIcons=true|false
}}
*/
export default Ember.Component.extend({
  layout: layout,
  tagName: 'form',
  classNameBindings: ['formLayoutClass'],
  attributeBindings: ['role'],
  role: 'form',
  form_layout_class: Ember.computed.deprecatingAlias('formLayoutClass'),
  formLayoutClass: Ember.computed('formLayout', function() {
    switch (this.get('formLayout')) {
      case 'horizontal':
      case 'inline':
        return "form-" + (this.get('formLayout'));
      default:
        return 'form';
    }
  }),
  isDefaultLayout: Utils.createBoundSwitchAccessor('form', 'formLayout', 'form'),
  isInline: Utils.createBoundSwitchAccessor('inline', 'formLayout', 'form'),
  isHorizontal: Utils.createBoundSwitchAccessor('horizontal', 'formLayout', 'form'),
  action: 'submit',
  model: null,
  form_layout: Ember.computed.deprecatingAlias('formLayout'),
  formLayout: 'form',
  submit_button: Ember.computed.deprecatingAlias('submitButton'),
  submitButton: true,
  v_icons: Ember.computed.deprecatingAlias('validationIcons'),
  validationIcons: true,
  showErrorsOnRender: false,
  showErrorsOnFocusIn: false,

  /*
  Form submit

  Optionally execute model validations and perform a form submission.
   */
  submit(e) {
    var promise;
    if (e) {
      e.preventDefault();
    }
    if (Ember.isNone(this.get('model.validate'))) {
      return this.get('targetObject').send(this.get('action'));
    } else {
      promise = this.get('model').validate();
      return promise.then((function(_this) {
        return function() {
          if (_this.get('model.isValid')) {
            return _this.get('targetObject').send(_this.get('action'));
          }
        };
      })(this));
    }
  }
});
