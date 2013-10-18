// client/client.js

Deps.autorun(function(){
	Meteor.subscribe("messages");
});

Template.main.events({
  'click .state': function (e, template) {
  	var state = e.currentTarget.id;
  	var dev =  template.find('#developer').value;
    var lastEntry = Messages.findOne({developer: dev});
    var now = Math.round(new Date().getTime() / 1000);
    if(lastEntry) {
    	if (lastEntry.state == state) {
    		return;
    	}
    	var age = now - lastEntry.created_at;
    	if (age < 10) {
    		var upd = Messages.update(lastEntry._id, {$set: {state: state, created_at: now}});
	    	console.log('updated');
	    	return;
    	} else {
    		console.log('would save to server ' + age);
    		Messages.remove(lastEntry._id);
    		// INSERT HERE AGAIN
    	}

    }
	
	Messages.insert({
				created_at: now,
				state:      state,
				developer:  dev
			});
		
	}
});


var states = [{state: 'green', class: 'btn-success'}, {state: 'yellow', class: 'btn-warning'}, {state: 'red', class: 'btn-danger'}];

Template.main.helpers({
    states: function() {
    	return states;
    }
});

Template.messages.helpers({
    messages: function() {
    	return Messages.find({}, {sort: {created_at: -1}}).fetch();
    }
});
