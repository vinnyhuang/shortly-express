window.Shortly = Backbone.View.extend({
  template: Templates['layout'],

  events: {
    'click li a.index': 'renderIndexView',
    'click li a.create': 'renderCreateView',
    'click li a.login': 'renderLoginView'
  },

  initialize: function() {
    console.log( 'Shortly is running' );
    $('body').append(this.render().el);

    this.router = new Shortly.Router({ el: this.$el.find('#container') });
    this.router.on('route', this.updateNav, this);

    Backbone.history.start({ pushState: true });
  },

  render: function() {
    this.$el.html( this.template() );
    return this;
  },

  renderIndexView: function(e) {
    e && e.preventDefault();
    this.router.navigate('/', { trigger: true });
  },

  renderCreateView: function(e) {
    e && e.preventDefault();
    this.router.navigate('/create', { trigger: true });
  },

  renderLoginView: function(e) {
    e && e.preventDefault();
    console.log('renderLoginView, app');
    console.log('this.router', this.router);
    console.log('this', this);
    this.router.navigate('/login', { trigger: true });
  },

  updateNav: function(routeName) {
    console.log('updateNav', routeName);
    this.$el.find('.navigation li a')
      .removeClass('selected')
      .filter('.' + routeName)
      .addClass('selected');
  }
});
