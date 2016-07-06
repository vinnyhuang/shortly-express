Shortly.createLoginView = Backbone.View.extend({
  className: 'login',

  template: Templates['login'],

  render: function() {
    console.log('createLoginView');
    this.$el.html( this.template() );
    return this;
  }
});
