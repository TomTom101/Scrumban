// REST API https://github.com/crazytoad/meteor-collectionapi

//db.report.group({ key: {state: 1}, initial: {total: 0}, reduce: function(curr, result) { result.total += curr.time; } })

Meteor.publish("messages", function() {
        return Messages.find({});
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
			case 'admin-del-messages':
				Messages.remove({});
				break;
			case 'admin-del-report':
				Report.remove({});
				break;
		}
	
	},
	save_to_report: function(time, state, identifier) {
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
		var now = Math.round(new Date().getTime() / 1000)
		var time_spent;

		Messages.find({}, {sort: {state: 1}}).forEach(function(doc) {
			time_spent = now - doc.created_at;
			Meteor.call("save_to_report", time_spent, doc.state, doc.identifier, function() {
					Messages.update(
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
	log_action: function(state, insert_id, identifier ) {
	
		console.log('For ' + identifier);
	
		var now = Math.round(new Date().getTime() / 1000);
		
		// Did the user create an action before and supplied the previous _id?
		if(identifier) {
			console.log('Id is ' + identifier);
		
			var lastEntry = Messages.findOne({identifier: identifier});
			
			// found an entry for it
			if(lastEntry) {
				var time_spent = now - lastEntry.created_at;
							
				Meteor.call("save_to_report", time_spent, lastEntry.state, identifier, function() {
					Messages.remove(lastEntry._id);
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
	
			return Messages.insert({
				created_at: now,
				state:      state,
				identifier:  identifier
			});	
		
		
		return 0;		
	}
});