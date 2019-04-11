/* global M, location, XMLHttpRequest, keccak512 */
const autoCompleteData = {}; // Here for scope perposes
let jsonData = {}; // As am I.
const defaultMinLength = 4; // We
const defaultMaxLength = 512; // All
let minLength = defaultMinLength; // Are,
let maxLength = defaultMaxLength; // Really
const defaultTheme = "Vanilla";
let themeData = {};
const debugMode = false;
const engineVersion = "6.0.0"; // Changed if breaking changes are made to the engine
let mode;
const date = new Date();
const cookieCrumble = new Date(date.getFullYear() + 1, date.getMonth(), date.getDate()); // Make a date 1 year into THE FUTURE
const possibleRequirements = {
	cap: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	low: "abcdefghijklmnopqrstuvwxyz",
	num: "0123456789",
	special: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"
};
const targetLength = 16;

/**
 * Gets a cookie
 * @param  {string} name - The name of the cookie to retrive
 * @returns {(string|undefined)} - Value of the cookie | If there is no cookie, undefined
 */
function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		return parts.pop().split(";").shift();
	}
	return undefined;
}

/**
 * Sets a cookie to a certain value
 * @param  {string} name - The name of the cookie to set
 * @param  {string} value -  The value to set that cookie to
 * @returns {void}
 */
function setCookie(name, value) {
	document.cookie = `${name}=${value}; expires=${cookieCrumble.toGMTString()}; path=/;`; // Set cookie to expire in 1 year
}

/**
 * Toggles the visability of the mode selector and sets the according cookie
 */
window.toggleSettings = function () {
	// Show the selector div
	const engineSelector = document.getElementById("engineSelector");

	engineSelector.style.display = engineSelector.style.display === "none" ? "block" : "none";
	// Click on the last used mode
	M.Tabs.getInstance(document.getElementById("engineTabs")).select(mode);

	// If engineSelector is visable
	if (engineSelector.offsetParent !== null) {
		setCookie("showSettings", "true");
	} else {
		document.cookie = "showSettings=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; // Delete the showSettings cookie
	}
};

function checkDebug() {
	if (debugMode) {
		document.title += ` - Debug ${new Date().getTime()}`;
		console.debug("Enabling debug css");
		const link = document.createElement("link");
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("type", "text/css");
		link.setAttribute("href", "debug.css");
		document.getElementsByTagName("head")[0].appendChild(link);
	}

	// If I'm testing, change the page title so I can tell the tabs apart
	if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
		document.title += " - LocalHost";
	}
}

function getQueryStrings() {
	const assoc = {};
	const decode = function (s) {
		return decodeURIComponent(s.replace(/\+/g, " "));
	};
	const queryString = location.search.substring(1);
	const keyValues = queryString.split("&");

	keyValues.forEach(product => {
		const key = product.split("=");
		if (key.length > 1) {
			assoc[decode(key[0])] = decode(key[1]);
		}
	});

	return assoc;
}

// For showing / hiding the master password
window.passwordToggle = function () {
	// If the switch is on / to the right / "Hide"
	if (document.getElementById("passwordToggle").checked) {
		// Make the password field use blobs
		document.getElementById("pass").type = "password";
	} else {
		// If it's off
		// Make the password field use actual text so you can see/copy it.
		document.getElementById("pass").type = "text";
	}
};

window.copy = function () {

	const pass = document.getElementById("result").value;

	if (pass === "") {
		M.toast({
			html: "You have no password to copy.",
			displayLength: 4000,
			classes: "warning"
		});
	} else {

		let copyElement = document.createElement("input");
		copyElement.setAttribute("type", "text");
		copyElement.setAttribute("value", pass);
		copyElement = document.body.appendChild(copyElement);
		copyElement.select();
		document.execCommand("copy");
		copyElement.remove();

		M.toast({
			html: "Successfully copied!",
			displayLength: 4000,
			classes: "success"
		});
	}

};

// For showing / hiding the generated password
window.resultToggle = function () {
	// If the switch is on / to the right / "Hide"
	if (document.getElementById("resultToggle").checked) {
		// Make the password field use blobs
		document.getElementById("result").type = "password";
	} else {
		// If it's off
		// Make the password field use actual text so you can see/copy it.
		document.getElementById("result").type = "text";
	}
};

/**
 * A random int between two values
 * @param  {Number} min - Lowest value possible, inclusive
 * @param  {Number} max - Highest value possible, exclusive
 */
function getRandomArbitrary(min, max) {
	return Math.trunc(Math.random() * (max - min) + min);
}

function changeTheme(passedTheme) {
	let usedTheme = passedTheme;
	if (passedTheme === "") {
		usedTheme = defaultTheme;
	} else if (!themeData[passedTheme]) {
		throw new Error(`Invalid theme  "${passedTheme}" `);
	} else {
		setCookie("theme", usedTheme);

		document.documentElement.style.setProperty("--accentColor", themeData[usedTheme].accent);
		document.documentElement.style.setProperty("--lightAccent", themeData[usedTheme].lightAccent);
		document.documentElement.style.setProperty("--textColor", themeData[usedTheme].text);
		document.documentElement.style.setProperty("--backgroundColor", themeData[usedTheme].background);
		document.documentElement.style.setProperty("--internalColor", themeData[usedTheme].internal);
		document.documentElement.style.setProperty("--incorrectColor", themeData[usedTheme].incorrect);
		document.documentElement.style.setProperty("--correctColor", themeData[usedTheme].correct);
		document.documentElement.style.setProperty("--inputColor", themeData[usedTheme].inputColor);
		document.documentElement.style.setProperty("--linkColor", themeData[usedTheme].linkColor);
		document.documentElement.style.setProperty("--highlightColor", themeData[usedTheme].highlightColor);
		document.documentElement.style.setProperty("--underlineColor", themeData[usedTheme].underlineColor);
	}
}

// Take inputs and display a password. (The black box)
function process() {
	let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"; // Defualt character set (Set here but overwritten if there's a custom one.)
	const requirements = []; // By default we have no requirements but reset it so we don't carry them over
	let appName = document.getElementById("app").value.trim();
	const masterPass = document.getElementById("pass").value;
	const length = Math.trunc(document.getElementById("length").value); // Get the desired length of a password and make sure it's an integer
	let result = ""; // Has to be here, not in the loop for scope purposes

	if (!(minLength <= length && length <= maxLength)) {
		// if the length is invalid
		if (length > maxLength) {
			// Too long
			document.getElementById("length").value = maxLength;
		} else if (length < minLength) {
			// Too short
			document.getElementById("length").value = minLength;
		} else {
			// Should never be triggered but better safe than sorry
			document.getElementById("length").value = 16;
			throw new Error("This should never happen");
		}

		// Now we have a sensible value, restart the process
		process();
		return;
	}

	// If the appname or password or length are empty
	if (appName === "" || masterPass === "" || length === "") {
		// Empty the output field
		document.getElementById("result").value = "";
		// Stop function from generating new password
		return;
	}

	// It's a valid attempt, continue

	if (jsonData[appName]) {
		// If it's a site with a preset
		console.debug(`Found preset: ${appName}`);

		// If it's an alias for another app
		if (jsonData[appName].alias) {
			// Change the name of the app we're using to its alias
			appName = jsonData[appName].alias;
		}

		// If it has a custom character set
		if ("chars" in jsonData[appName]) {
			// Replace the default character set with the supplied one.
			chars = jsonData[appName].chars;
		}

		if ("requirements" in jsonData[appName]) {
			for (let i = 0; i < jsonData[appName].requirements.length; i++) {
				requirements.push(
					possibleRequirements[jsonData[appName].requirements[i]]
				);
			}
		}
	}

	console.debug("Started generating password");

	// Set the generation seed
	if (mode === "new") {
		Math.seedrandom(keccak512(appName.toLowerCase() + masterPass));
	} else {
		Math.seedrandom(appName.toLowerCase() + masterPass);
	}

	// password generation cycle
	while (true) {
		result = "";
		while (result.length < length) {
			// Add one seeded random character at a time
			result += chars[Math.floor(Math.random() * chars.length)];
		}

		// If there's requirements to forfill
		if (requirements !== []) {
			let nope = false;
			for (let j = 0; j < requirements.length; j++) {
				// For each requirement
				for (let c = 0; c < requirements[j].length; c++) {
					// For each character in the requirement group
					if (result.indexOf(requirements[j][c]) !== -1) {
						// If that character is in the password
						break;
					}
					if (
						requirements[j].indexOf(requirements[j][c]) === requirements[j].length - 1
					) {
						nope = true;
						break;
					}
				}
			}

			if (!nope) {
				// If all tests passed
				break;
			}
		} else {
			// no requirements
			break;
		}
	}

	// The password has been generated

	// Display password
	document.getElementById("result").value = result;
}

/**
 * Changes the mode to either
 * @param  {string} setTo - Either "old" or "new", "old" being legacy mode and "new" being suggested mode
 * @returns {void}
 */
window.setMode = function (setTo) {
	mode = setTo;
	setCookie("mode", setTo);
	process();
};

/**
 * On page load
 */
window.onload = function () {
	if (getCookie("cookieHidden") !== undefined) {
		document.getElementById("cookieAlert").style.display = "none";
	}

	// Process the sites.json for the autocomplete structure
	const sites = new XMLHttpRequest();
	sites.onload = function () {
		jsonData = JSON.parse(sites.response);

		const qs = getQueryStrings();

		if (qs.app) {
			const appName = String(qs.app);
			// If it's a preset
			if (jsonData[appName]) {
				let length = targetLength;
				let max = jsonData[appName].maxLength;

				if (!max) {
					max = defaultMaxLength;
				}

				if (!(jsonData[appName].minLength <= length && length <= max)) {
					length = max;
				}

				document.getElementById("length").value = length;

				// In case there's already a password (eg switching sites / presets) regen password
				process();

				let logo;

				if (jsonData[appName].logo) {
					logo = jsonData[appName].logo;
				} else {
					logo = `logos/${appName}.svg`;
				}

				// Set image
				document.getElementById("logoContainer").style.display = "flex";
				document.getElementById("logo").src = logo;
				document.getElementById("logo").alt = appName;
				document.getElementById("logo").title = appName;
			}
			// Set the app name
			document.getElementById("app").value = appName;

			document.querySelector("label[for='app']").classList.add("active");
		}

		for (const key in jsonData) {
			// If the preset has a custom logo url
			if (jsonData[key].logo) {
				autoCompleteData[key] = jsonData[key].logo;
			} else {
				// Set the logo url to the default
				autoCompleteData[key] = `logos/${key}.svg`;
			}
		}

		// Setup possible autocomplete sites
		M.Autocomplete.init(document.getElementById("app"), {
			data: autoCompleteData,

			// called when an autocomplete is used.
			onAutocomplete(val) {
				// Set image
				document.getElementById("logoContainer").style.display = "flex";
				document.getElementById("logo").src = autoCompleteData[val];
				document.getElementById("logo").alt = val;
				document.getElementById("logo").title = val;
				let length = targetLength;

				// If it's an alias for another app
				if (jsonData[val].alias) {
					// Change the name of the app we're using to its alias
					val = jsonData[val].alias;
					console.debug(`Using alias: ${val}`);
				}

				if (jsonData[val].minLength) {
					minLength = jsonData[val].minLength;
				} else {
					minLength = defaultMinLength;
				}
				document.getElementById("length").min = minLength;

				if (jsonData[val].maxLength) {
					maxLength = jsonData[val].maxLength;
				} else {
					maxLength = defaultMaxLength;
				}

				document.getElementById("length").max = maxLength;

				if (!(minLength <= length && length <= maxLength)) {
					length = maxLength;
				}

				document.getElementById("length").max = maxLength;

				// In case there's already a password (eg switching sites / presets) regen password
				process();
			},
			// Minimum number of characters typed for the dialog to open
			minLength: 0,
			// For deciding the order of options.
			sortFunction(a, b, inputString) {
				// inputString will always be in both a and b if present

				// if there's a given inputString
				if (inputString) {
					// If only "a" starts with inputString
					if (a.startsWith(inputString) && !b.startsWith(inputString)) {
						return -1;
					}

					// If only "b" starts with inputString
					if (!a.startsWith(inputString) && b.startsWith(inputString)) {
						return 1;
					}
					// If both "a" and "b" start with inputString we do the same as always so
				}

				if (a < b) {
					return -1;
				}
				// No need for else if as if the prior condition was true, we'd return so wouldn't run this line
				if (a > b) {
					return 1;
				}
				// a must be equal to b
				return 0;
			}
		});

		// Autocomplete has been setup
		// Move the cursor to the app field
		document.getElementById("app").focus();
	};
	sites.open("get", "data/sites.json", true);
	sites.send();

	// Process the sites.json for the autocomplete structure
	const themes = new XMLHttpRequest();
	themes.onload = function () {
		themeData = JSON.parse(themes.response);

		for (const key in themeData) {
			const themeRadio = document.createElement("li");
			themeRadio.innerHTML = `<a class='btn-floating' onclick='changeTheme("${key}");' id='${key}' ><i class='material-icons'>color_lens</i></a>`;
			document.getElementById("fabs").appendChild(themeRadio);

			const css = `a[id=${key}]{background-color: ${
				themeData[key].background
			} !important; border: 1px ;}a[id=${key}] i {color: ${themeData[key].text}`;
			const style = document.createElement("style");
			style.type = "text/css";
			if (style.styleSheet) {
				// This is required for IE8 and below.
				style.styleSheet.cssText = css;
			} else {
				style.appendChild(document.createTextNode(css));
			}
			document.getElementsByTagName("head")[0].appendChild(style);
		}

		// If the user has a prefered theme
		if (getCookie("theme") !== undefined) {
			console.debug(`Found a prefered theme. Loading ${getCookie("theme")}`);
			changeTheme(getCookie("theme"));
			// Use the clicked CSS for the button
			document.getElementById(getCookie("theme")).checked = true;
		} else {
			// If no theme cookie exists
			// Click the vanilla theme.
			document.getElementById("Vanilla").checked = true;
			changeTheme(defaultTheme);
		}

		M.FloatingActionButton.init(
			document.querySelectorAll(".fixed-action-btn"), {
				direction: "left", // Direction menu comes out
				hoverEnabled: false, // Hover disabled
				toolbarEnabled: false // Toolbar transition disabled
			}
		);
	};

	themes.open("get", "data/themes.json", true);
	themes.send();

	// Set the engine version cookie if we haven't before
	if (getCookie("engineVersion") === undefined) {
		setCookie("engineVersion", engineVersion);
	}

	// Set the mode cookie if we haven't before
	if (getCookie("mode") === undefined) {
		if (getCookie("engineVersion") !== "5.10.0") {
			mode = "new";
		} else {
			mode = "old";
		}
		setCookie("mode", mode);
	} else {
		mode = getCookie("mode");
	}

	// Initialize tooltips
	M.Tooltip.init(document.querySelectorAll(".tooltipped"));
	// Initialize the tabs
	M.Tabs.init(document.querySelectorAll(".tabs"));
	const tabs = M.Tabs.getInstance(document.getElementById("engineTabs"));

	if (getCookie("showSettings") === "true") {
		document.getElementById("engineSelector").style.display = "block";
	}

	if (mode === "new" || mode === "old") {
		tabs.select(mode);
	} else {
		throw new Error(`Invalid mode  "${mode}" `); // Using the inferior kind of quotes so I may see the superior ones apon error
	}

	//  If the user is on a PC, not a mobile device
	if (
		!(typeof window.orientation !== "undefined") ||
			navigator.userAgent.indexOf("IEMobile") !== -1
	) {
		// Change the install icon to reflect that
		document.getElementById("install-icon").innerHTML = "add_to_queue";
	}

	checkDebug();
};

/**
 * Save the current master password as a cookie
 */
window.save = function exported() {
	if (document.getElementById("pass").value) {
		// If there's a password
		setCookie("password", document.getElementById("pass").value);
		M.toast({
			html: "Password saved to your device!",
			displayLength: 4000,
			classes: "success"
		});
	}
};

/**
 * Use the current password as a seed to colour the underline of the field
 */
function colourUnderline() {
	// If there's a password
	if (document.getElementById("pass").value) {
		// Seed the
		Math.seedrandom(document.getElementById("pass").value);
		const colour = `HSL(${getRandomArbitrary(0, 360)}, ${getRandomArbitrary(
			60,
			100
		)}%, ${getRandomArbitrary(45, 80)}%)`;
		document
			.getElementById("pass")
			.style.setProperty("--underlineColor", colour);
	} else {
		// If there's no password, reset the underline colour
		document.getElementById("pass").removeAttribute("style");
	}
}

window.load = function () {
	// Load the saved password from cookie
	if (getCookie("password") !== undefined) {
		const password = getCookie("password"); // Get the password from the cookie
		document.querySelector("label[for='pass']").classList.add("active"); // Raise the text on the input
		document.getElementById("pass").value = password; // Fill the password input with the correct password
		process();
		M.toast({
			html: "Password loaded from your device!",
			displayLength: 4000,
			classes: "success"
		});
	} else {
		M.toast({
			html: "You have no saved password to load.",
			displayLength: 4000,
			classes: "warning"
		});
	}

	colourUnderline();
};

window.appInput = function (e) {
	// Clear logo
	document.getElementById("logoContainer").style.display = "none";
	document.getElementById("logo").removeAttribute("src");
	document.getElementById("logo").removeAttribute("alt");
	document.getElementById("logo").removeAttribute("title");

	// Reset the mins and maxes for length
	minLength = defaultMinLength;
	maxLength = defaultMaxLength;
	document.getElementById("length").max = maxLength;
	document.getElementById("length").min = minLength;

	document.getElementById("length").value = targetLength;

	process();
};

window.passwordUp = function () {
	colourUnderline();

	// Regen the password
	process();
};

window.addEventListener("beforeinstallprompt", e => {
	window.installPromptEvent = e;
	// Prevent Chrome 67 and earlier from automatically showing the prompt
	e.preventDefault();
	// Show the prompt on later versions
});

window.appDown = function (e) {

	// Enter pressed and dropdown visible
	if (
		(e.key === "Enter" || e.code === "Enter" || e.keyCode === 13) &&
		document.querySelector(".autocomplete-content.dropdown-content").offsetHeight > 0
	) {

		// If no entry is selected
		if (document.querySelector(".autocomplete-content.dropdown-content .active") === null) {
			document.querySelector(".autocomplete-content.dropdown-content :first-child").click();
		}

	}

};
