Activities = new Meteor.Collection("activities");
Report = new Meteor.Collection("report");

//Accounts.config({ restrictCreationByEmailDomain: 'native-instruments.de' });

	
Scrumban = {
	states: [
				{ name: 'green', btn_class: 'success', lbl_class: 'success'},
				{ name: 'yellow', btn_class: 'warning', lbl_class: 'warning'}, 
				{ name: 'red', btn_class: 'danger', lbl_class: 'important'}
	],
	get_report: function(identifier) {
		var obj = {};
		var total = 0;
		var query = {};
		if(identifier) {
			query.identifier = identifier;
		}
		
		Report.find(query).map(function(doc) {
			if(!obj[doc.state]) {
				obj[doc.state] = 0;
			}
			obj[doc.state] += doc.time;
			total += doc.time;
		});
		// very ugly. Handlebars cannot iterate over an indexed array?!? Needs an object, for which no map() exists
		obj.yellow = Math.round((obj.yellow/total)*100) || 0;
		obj.red = Math.round((obj.red/total)*100) || 0;
		obj.green = 100 - obj.red - obj.yellow;
		return obj;	
	},
	update_report_interval: 10000000
}


