// REST API https://github.com/crazytoad/meteor-collectionapi

//db.report.group({ key: {state: 1}, initial: {total: 0}, reduce: function(curr, result) { result.total += curr.time; } })

Meteor.setInterval(function() {
	Meteor.call("update_report", function() {
	});
}, Scrumban.update_report_interval);

Meteor.methods({
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
		console.log("update_report");
		//find message created < now - x
		/*
			foreach 
				calc now - created = time
				-> call save_to_report(time, state…) (
					update message.created_at to now	
				)
		*/
	},
	log_action: function(insert_id, state, identifier ) {
	
		var now = Math.round(new Date().getTime() / 1000);

		if(insert_id) {
			var lastEntry = Messages.findOne({_id: insert_id});
			
			if(lastEntry) {
				if (lastEntry.state == state) {
					return;
				}
				
				var time_spent = now - lastEntry.created_at;

				if (time_spent < 1) {
					// only update state w/ the new one, leaving creation date the same
					var upd = Messages.update(lastEntry._id,
						{
							$set:
							{state: state}
						});
					console.log('updated');
					return;
					
				} else {
					
				
					//update anstatt remove
					Messages.remove(lastEntry._id);
					Meteor.call("save_to_report", time_spent, lastEntry.state, identifier, function() {
						console.log('Saved to server ' + time_spent);
					});
				}
			}		
		}
	
		return Messages.insert({
				created_at: now,
				state:      state,
				identifier:  identifier
		});	
	}	
});