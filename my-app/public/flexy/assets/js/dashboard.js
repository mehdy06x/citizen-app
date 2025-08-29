// Simplified Flexy dashboard script (ApexCharts usage)
document.addEventListener('DOMContentLoaded', function(){
	try{
		// create a simple bar chart if the target exists
		if(window.ApexCharts && document.querySelector('#sales-overview')){
			const options = {
				series:[{name:'Series A',data:[100,200,150,300,250,200]}],
				chart:{type:'bar',height:250},
				xaxis:{categories:['Mon','Tue','Wed','Thu','Fri','Sat']}
			};
			const chart = new ApexCharts(document.querySelector('#sales-overview'), options);
			chart.render();
		}
	}catch(e){console.error(e)}
});
