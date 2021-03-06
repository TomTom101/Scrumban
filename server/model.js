// REST API https://github.com/crazytoad/meteor-collectionapi

//db.report.group({ key: {state: 1}, initial: {total: 0}, reduce: function(curr, result) { result.total += curr.time; } })


Meteor.publish("activities", function() {
        return Activities.find({});
});

Meteor.publish("activities-others", function() {
        return Activities.find({ identifier: { $ne: this.userId } } );
});

Meteor.publish("activities-red", function() {
        return Activities.find({state: 'red'});
});

Meteor.publish("reports", function() {
        return Report.find({});
});

Meteor.publish("userData", function () {
    return Meteor.users.find({_id: this.userId});
});

Meteor.setInterval(function() {
	Meteor.call("update_report", function() {
	});
}, Scrumban.update_report_interval);

Meteor.methods({
	admin_delete: function(type) {
		switch (type) {
			case 'admin-del-activities':
				Activities.remove({});
				break;
			case 'admin-del-report':
				Report.remove({});
				break;
		}
	
	},
	save_to_report: function(time, state, identifier) {
		// must be a day, no time
		var today = new Date(moment().format('MMM D, YYYY'));
		return Report.update(
			{
				date: today,
				state: state,
				identifier: identifier
			},
			{
				$inc: { time: time }
			},
			{
				upsert: true
			}					
		);		
	},
	update_report: function() {
		var now = new Date();
		var time_spent;

		Activities.find({}, {sort: {state: 1}}).forEach(function(doc) {
			//@todo use new last_saved instead to leave created date untouched
			time_spent = Math.round((now - doc.created_at)/1000);
			Meteor.call("save_to_report", time_spent, doc.state, doc.identifier, function() {
					Activities.update(
						{
							_id: doc._id
						},
						{ $set: {
								created_at: now
								}
						}
					);
					console.log('Saved to server ' + time_spent);
			});
		});

	},
	log_action: function(state, identifier ) {
	
		// If state = red, all other actions must be stopped!
		// update_report
		// remove all state!=red
	
		console.log('For ' + identifier);
	
//		var now = Math.round(new Date().getTime() / 1000);
		var now = new Date();
		
		// Did the user create an action before and supplied the previous _id?
		if(identifier) {
		
			var lastEntry = Activities.findOne({identifier: identifier});
			
			// found an entry for it
			if(lastEntry) {
				var time_spent = Math.round((now - lastEntry.created_at)/1000);
							
				Meteor.call("save_to_report", time_spent, lastEntry.state, identifier, function() {
					Activities.remove(lastEntry._id);
					console.log('Action ' + lastEntry._id + ' removed' );
					console.log('Saved to server ' + time_spent);
				});
				
				// If the same button is clicked again, we stop the action
				if (lastEntry.state == state) {					
					console.log('Action ' + state + ' stopped' );
					return null;
				}				
			}
		}
			
			console.log('Create new action record');
	
			return Activities.insert({
				created_at: now,
				state:      state,
				identifier:  identifier
			});	
		
		
		return 0;		
	}
});