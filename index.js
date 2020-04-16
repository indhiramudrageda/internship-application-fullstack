var variants = [];
var selectedVariant;
var url;
addEventListener('fetch', event => {
	url = getCookie(event.request, 'variant');

	//if variant is already set in cookie, using the same to display and not fetching the variants again.
	if(url) {
		selectedVariant = url.charAt(url.length-1);
		event.respondWith(handleRequest(event.request, null))
	} else { //else, fetching the variants data and populating 'variants' array.
		const res = getVariants();
  		event.respondWith(handleRequest(event.request, res))
	}	
})

async function getVariants() {
	const myRequest = new Request('https://cfw-takehome.developers.workers.dev/api/variants');
	await fetch(myRequest)
  	.then(response => {
  		return response.json()
  	})
	.then(data => {
  		variants = data.variants;
	})
	.catch(error => {
  		console.error('Error:', error);
	});

	return fetch(myRequest);
}

/**
 * Respond with variant
 * @param {Request} request
 */
async function handleRequest(request, res) {
	if(res)
		await res;

	let content = "";	
	// If url is not set, implying first time request, variant is picked at random.
	if (!url) {
		selectedVariant = getRandomInt(variants.length);
		url = variants[selectedVariant];
		selectedVariant++;
  	}
	const myRequest = new Request(url);
	await fetch(myRequest)
  	.then(response => {
  		return response.text()
  	})
	.then(data => {
  		content = data; //html text from chosen variant is populated into content.
	})
	.catch(error => {
  		console.error('Error:', error);
	});

	//Contents of the variant page are being modified and response is being sent along with cookie containing the chosen variant url.
	return new HTMLRewriter().on('*', new ElementHandler()).transform(new Response(content, { headers: { 'content-type': 'text/html', 'Set-Cookie' : 'variant='+url} }));
}

function getCookie(request, name) {
  let result = null;
  let cookieStr = request.headers.get('Cookie');
  if (cookieStr) {
    let cookies = cookieStr.split(';');
    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim();
      if (cookieName === name) {
        let cookieVal = cookie.split('=')[1];
        result = cookieVal;
      }
    })
  }
  return result;
}

class ElementHandler {
  element(element) {
    if(`${element.tagName}` == 'title')
    	element.setInnerContent('Custom Variant '+selectedVariant);
    if(`${element.tagName}` == 'h1' && element.getAttribute('id') == 'title')
    	element.setInnerContent('Custom Variant '+selectedVariant);
    if(`${element.tagName}` == 'p' && element.getAttribute('id') == 'description')
    	element.setInnerContent("This is variant "+ selectedVariant +" of the take home project after making custom changes!");
    if(`${element.tagName}` == 'a' && element.getAttribute('id') == 'url') {
   		element.setAttribute('href','https://personal.utdallas.edu/~ixm190001/');
		element.setInnerContent('Visit my personal website');
    }
  }

  comments(comment) {
  }

  text(text) {
  }
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
