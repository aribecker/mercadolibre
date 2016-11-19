/*
11) Using the following API endpoint: https://api.mercadolibre.com/sites/MLA/search/
Create a search input that allows searching for any given product and shows a list of 10 items ordered by price from lowest to highest. 
Please make sure that what you do looks similar to the provided mockup (ex.png) 
You are free to use any library that you feel it might help you getting this exercise done; jQuery, lodash, bootstrap, just to name a few
*/

/**
 * @function getUserDescription
 * Gets the user information from ML users service
 * @param {string} userId
 * @return {Promise{Object}} - the returned promise that, when resolved, will contain the user info
 */
function getUserDescription(userId) {
	var baseUrl = 'https://api.mercadolibre.com/users';
	var url = baseUrl + '/' + userId; // TODO use es6
	var promise = $.ajax({
		url: url,
		type: "GET"
	});
	return promise;
}

/**
 * @function getUserDescriptions
 * Decorator
 * Decorates the items results from searchML with the nickname of the sellers
 * @param {array} results
 * @param {integer} index - it's used internally when recursing. The consumer must not supply this argument
 * @return {Promise} - the returned promise that, when resolved, will indicate that it's finished
 * NOTE: I couldn't find in ML services an expand to get the nickname of the seller, nor a /users service to retrieve multiple users
 */
function getUserDescriptions(results, index) {
	index = index || 0;
	if (index < results.length) {
		return getUserDescription(results[index].seller.id).then(function(data){
			results[index].seller.nickname = data.nickname;
			return getUserDescriptions(results, index + 1);
		});
	} else {
		return $.Deferred().resolve().promise();
	}
}

/**
 * @function searchML
 * Calls ML api to get the list of matched items for a given search string
 * @param {string} q - the search string
 * @param {string} sortId - could be price_asc or price_desc, among others
 * @return {Promise} - the returned promise that, when resolved, will contain the search results info containing the retrieved items, among other properties
 */
function searchML(q, sortId) {
	var baseUrl = 'https://api.mercadolibre.com/sites/MLA/search';
	var sortQuery = ( sortId ? '&sort=' + sortId : '');
	var url = `${baseUrl}?q=${q}${sortQuery}` ;
	return $.ajax({
		url: url,
		type: "GET"
	});
}

/**
 * @function formatPrice
 * Formats a price accodring to the mockups. It's used from inside the template
 * @param {number} price
 * @return {String} - the formatted price to show in the page
 */
function formatPrice(price) {
	var integer = Math.trunc(price);
	var sinteger = ('' + Math.trunc(price)).split('');
	if (sinteger.length > 3) {
		sinteger.splice(-3,0,'.');
		if (sinteger.length > 7) {
			sinteger.splice(-7,0,'.');
		}
	}
	var decimal = (Math.trunc ( (price - integer) * 100) + '00' ).substring(0,2);
	return sinteger.join('') + ',' + decimal;
}

/**
 * @function showResults
 * Outputs to its corresponding div the (decorated with seller nicknames) items retrieved by searchML
 * @param {results} the decorated list (array) of retrieved items
 */
function showResults(results) {
	var tpl = `
	<table class="results-table">
	<thead>
		<th class="title">Item</th>
		<th class="thumbnail">Thumbnail</th>
		<th class="nickname">Seller Name</th>
		<th class="price">Price</th>
	</thead>
		<tbody>
			<% _.each(results,function(result){ %>
				<tr>
					<td class="title"><%= result.title %></td>
					<td class="thumbnail"> <img src="<%= result.thumbnail %>"></td>
					<td class="nickname"><%= result.seller.nickname %></td>
					<td class="price">$<%= formatPrice(+result.price) %></td>
				</tr>
		  <% }); %>			
		</tbody>
	</table>
	`;
	if (results.length) {
		$("#results").html(_.template(tpl)({
			results: results
		}));
	} else {
		showError('No articles found');
	}
}

/**
 * @function hideResults
 * Erases the content of the results div
 * NOTE: An enhancement to this function would be to use a css class to control the show/hide of the element
 */
function hideResults() {
	$("#results").html('');
}

/**
 * @function showError
 * Outputs to the corresponding div the error message
 */
function showError(errorText) {
	$("#error").html(errorText);
}

/**
 * @function hideError
 * Erases the content of the error div
 * NOTE: An enhancement to this function would be to use a css class to control the show/hide of the element
 */
function hideError() {
	$("#error").html('');
}

/**
 * @function setUpListeners
 * Registers the listener to the submit button and replaces the default behavoir
 */
function setUpListeners() {
	var errorText = 'Sorry, there was a problem retrieving the articles';
	$('#spinner').hide();
	$('#submit').click( function() {
		hideResults()
		hideError()
		$('#spinner').show();
		var maxItems = 10;
		var search = $('#search').val();
		searchML(search, 'price_asc').then(function(data){
			var results = data.results.slice(0, maxItems);
			getUserDescriptions(results).then(function(){
				$('#spinner').hide();
				showResults(results);
			}).catch(function(error){
				$('#spinner').hide();
				showError(errorText);
			});
		}).catch(function(error) {
			$('#spinner').hide();
			showError(errorText);
		});
		return false; // Prevent submission
	});
}

// Sets up everything once the document is ready to accept dom manipulations
$(document).ready(function(){
	setUpListeners();
})


	