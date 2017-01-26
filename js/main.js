var main = document.getElementsByClassName('js-content-generator')[0];
var code = document.getElementsByClassName('js-content-code')[0];
var mainNav = document.getElementsByClassName('js-content-generator--trigger')[0];
var codeNav = document.getElementsByClassName('js-content-code--trigger')[0];
var jsonDownloadBtn = document.getElementsByClassName('js-json-download')[0];
var states = ['Pending', 'In progress', 'Completed'];
var jsonContent;

function setup() {
	var sections = document.getElementsByClassName('content-section');
	var roadMapItems = document.getElementsByClassName('road-map__item');
	var addItems = document.getElementsByClassName('content-section__add');

	XHR('roadMap.json', function(response) {
		jsonContent = JSON.parse(response);
		buildPage(jsonContent);
		buildCode(jsonContent);
		for(var i = 0; roadMapItems.length > i; i++) {
			editEntry(roadMapItems[i]);
			deleteEntry(roadMapItems[i]);
		}

		for(var i = 0; addItems.length > i; i++) {
			addItem(addItems[i]);
		}
	});

	setupNav();
}

setup();

function setupNav() {
	mainNav.addEventListener('click', function() {
		mainNav.classList.add('is-active');
		codeNav.classList.remove('is-active');

		main.classList.add('is-active');
		code.classList.remove('is-active');
	});

	codeNav.addEventListener('click', function(e) {
		codeNav.classList.add('is-active');
		mainNav.classList.remove('is-active');

		code.classList.add('is-active');
		main.classList.remove('is-active');

		buildCode(jsonContent);
	});
}

function buildCode(content) {
	var codeContainer = code.getElementsByClassName('code-container')[0];
	var codeContent = document.createElement('code');
		codeContent.innerText = generateFullCode(content);

	codeContainer.innerHTML = '';
	codeContainer.appendChild(codeContent);
}

var generateFullCode = function(content) {
	var intro 	= '<div class="bl-3">'
				+ '<div class="l-border--bottom l-pad-bottom">'
				+ '<div class="h5 tight l-margin-null l-margin-bottom--xs">Our Mission</div><div class="h5 tight l-margin-null l-block l-margin-bottom--sm">We are a platform, powered by a global community, that seeks to unlock the true potential of the building brick.</div>'
	 			+ '<div>Below is a list of updates that have been completed, are in progress, or are yet to come. Please note that listings are not necessarily in order of priority.</div>'
				+ '</div>';
	var sections = generateCodeSections(content);

	return intro + sections;
}

var generateCodeSections = function(content) {
	var sections = content['sections'];
	var codeSections = '';

	for(var i = 0; sections.length > i; i++) {
		var title = '<div class="h5 tight l-margin-null l-margin-bottom--sm">' + sections[i]['title'] + '</div>';
	 	var sectionItems = sections[i]['items'];
		var itemsContent = '';
		var statusClass = {'Pending': 'text-color--grey', 'In progress': 'text-color--primaryBlue', 'Completed': 'text-color--primaryGreen'}

		for(var t = 0; sectionItems.length > t; t++) {
			itemsContent 	+= 	'<div class="l-full-width l-float-left l-pad-bottom--xs text-color--grey">'
							+	'<div class="l-float-left ' + statusClass[sectionItems[t]['status']] + '" style="width:15%"><i>' + sectionItems[t]['status'] + '</i></div>'
							+	'<div class="l-float-left l-pad-left--sm" style="width:85%">' + sectionItems[t]['text'] + '</div>'
							+	'</div>';
		}

		var items = '<div class="l-full-width l-border--bottom l-float-left l-pad-y">' + title + itemsContent + '</div>';
		codeSections += items;
	}

	return codeSections;
}


function buildPage(content) {
	var sections = content['sections'];

	for(var i = 0; sections.length > i; i++) {
		var title = '<div class="content-section__title">' + sections[i]['title'] + '</div>';
		var sectionContent = document.createElement('section');
			sectionContent.className = 'content-section';

		var sectionItems = sections[i]['items'];
		var itemsContent = '';
		var items, add;

		for(var t = 0; sectionItems.length > t; t++) {
			var currentItem = sectionItems[t];
			var status = currentItem['status'];
			var text = currentItem['text'];
			var id = currentItem['id'];

			itemsContent += '<div class="road-map__item" data-id="' + id + '">' + generateSaved(status, text) + '</div>';
		}

		items = '<div class="content-section__items" data-parent="' + sections[i]['id'] + '">' + itemsContent + '</div>';
		add = '<div class="content-section__add">Add Item</div>';

		sectionContent.innerHTML = title + ' ' + items + add;
		main.appendChild(sectionContent);
	}
}

function XHR(file, callback){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            callback(xhr.responseText);
        }
    }
    xhr.open('GET', file, true);
    xhr.send();
}

var stateDropdown = function (initial = 'Pending'){
	var dropdown = '<select>';

	for(var i = 0; states.length > i; i++) {
		dropdown += '<option value="' + states[i] + '" ' + (initial == states[i] ? 'selected' : '') + '>' + states[i] + '</option>';
	}

	dropdown += '</select>';

	return dropdown;
}

var generateEdit = function (status = 'Pending', text = '') {
	var item = '<div class="road-map__status">' + stateDropdown(status) + '</div><div class="road-map__text"><textarea>' + text + '</textarea></div><div class="road-map__options"><button class="option-btn option-btn--save"><i class="fa fa-save"></i></button><button class="option-btn option-btn--delete"><i class="fa fa-trash"></i></button></div>';

	return item;
}

var generateSaved = function (status = 'Pending', text = '') {
	var item = '<div class="road-map__status">' + status + '</div><div class="road-map__text">' + text + '</div><div class="road-map__options"><button class="option-btn option-btn--edit"><i class="fa fa-pencil"></i></button><button class="option-btn option-btn--delete"><i class="fa fa-trash"></i></button></div>';

	return item;
}

function deleteEntry(_this) {
	var optionBtn = _this.getElementsByClassName('option-btn--delete')[0];

	optionBtn.addEventListener('click', function() {
		removeFromJSON(_this);
		_this.remove();
	});
}

function editEntry(_this) {
	var optionBtn = _this.getElementsByClassName('option-btn--edit')[0];

	optionBtn.addEventListener('click', function() {
		var status = _this.getElementsByClassName('road-map__status')[0].innerText;
		var text = _this.getElementsByClassName('road-map__text')[0].innerText;

		_this.innerHTML = generateEdit(status, text);

		saveEntry(_this);
		deleteEntry(_this);
	});
}

function saveEntry(_this) {
	var optionBtn = _this.getElementsByClassName('option-btn--save')[0];

	optionBtn.addEventListener('click', function() {
		var statusIndex = _this.getElementsByClassName('road-map__status')[0].getElementsByTagName('select')[0].selectedIndex;
		var status = states[statusIndex];
		var text = _this.getElementsByClassName('road-map__text')[0].getElementsByTagName('textarea')[0].value;
		
		_this.innerHTML = generateSaved(status, text);

		deleteEntry(_this);
		editEntry(_this);
		updateJSON(_this);
		saveToJson(jsonContent);
	});
}

function addItem(_this) {
	var parent = _this.parentElement.getElementsByClassName('content-section__items')[0];

	_this.addEventListener('click', function() {
		var children = parent.getElementsByClassName('road-map__item');
		var lastID = children[children.length - 1].getAttribute('data-id');
		var newItem = document.createElement('div');
			newItem.className = 'road-map__item';
			newItem.innerHTML = generateEdit();
			newItem.setAttribute('data-id', parseInt(lastID) + 1);

		parent.appendChild(newItem);

		saveEntry(newItem);
		deleteEntry(newItem);
	});
}

function removeFromJSON(_this) {
	var parent = _this.parentElement;
	var parentID = parent.getAttribute('data-parent');
	var thisID = _this.getAttribute('data-id');
	var section = jsonContent['sections'][parentID]; 
	var sectionItems = section['items'];
	var key;

	for(var i = 0; sectionItems.length > i; i++) {
		if(sectionItems[i]['id'] == thisID) {
			key = i;
			jsonContent['sections'][parentID]['items'].splice(key, 1);

			return;
		}
	}
}

function updateJSON(_this) {
	var parent = _this.parentElement;
	var parentID = parent.getAttribute('data-parent');
	var thisID = _this.getAttribute('data-id');
	var newStatus = _this.getElementsByClassName('road-map__status')[0].innerText;
	var newText = _this.getElementsByClassName('road-map__text')[0].innerText;
	var section = jsonContent['sections'][parentID]; 
	var sectionItems = section['items'];
	var key;

	for(var i = 0; sectionItems.length >= i; i++) {
		if(i == sectionItems.length) {
			key = i;
			jsonContent['sections'][parentID]['items'].push({"id": thisID, "status": newStatus, "text": newText});
			
			return;
		}else if(sectionItems[i]['id'] == thisID) {
			key = i;
			jsonContent['sections'][parentID]['items'][key]['status'] = newStatus;
			jsonContent['sections'][parentID]['items'][key]['text'] = newText;
			
			return;
		}
	}
}

function saveToJson(content) {
	var content = JSON.stringify(content);
	var blob = new Blob([content], {type: "application/json"});
	var url = URL.createObjectURL(blob);

	jsonDownloadBtn.download = 'roadMap.json';
	jsonDownloadBtn.href = url;
}