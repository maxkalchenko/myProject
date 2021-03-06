function capitalize(str) {
  str = str.toLowerCase();
  str = str.toString().split('');
  str[0] = str[0].toUpperCase();

  return str.join('');
}


function validate(input) {
    var validateType = {
      'text': function(input) {
         return (input.value.length > 0);
      },
      'number': function(input) {
        return (input.value > 0);
      }
    };

    var validator = validateType[input.type] || function() {
      throw new Error('No validator for type ' + input.type);
    };

    if (!validator(input)) {
  	   input.value = input.type === 'number' ? 0 : "INSERT " + input.name;
       input.style.color = "red";
       return false;
    }

     return true;
}


function getPersonInfo() {
  var person = {
    firstName: null,
    lastName: null,
    age: null,
    email: null
  };

  var isFieldsValid = !(Object.keys(person)
    .map(function(key) {
        return validate(document.getElementById(key));
    })
    .filter(function(isValid) {
      return !isValid;
    }).length);

  if (!isFieldsValid) {
    return;
  }

  Object.keys(person)
    .forEach(function(key) {
      return person[key] = document.getElementById(key).value;
    });

  person.email = person.firstName +  '.' + person.lastName + '@fakemail.com';

  Object.keys(person)
    .forEach(function(key) {
        document.getElementById(key).value = null;
    });

  return Object.assign(person, {
    lastName: capitalize(person.lastName),
    firstName: capitalize(person.firstName),
    email: person.email.toLowerCase()
  });
}


function resetInput() {
  if (this.style.color === 'red') {
    this.style.color = 'black';
    this.value = null;
  }
}


function List(container, list) {
  this.container = container;
  this.table = container.querySelector("tbody");
  this.list = list;

  this.bindEvents();
  this.render();
}


List.prototype = {
  changeTableList: function(list) {
  	this.list = list;
    this.render();
  },

  bindEvents: function() {
    var sortButtons = this.container.querySelectorAll('.sort-button');

    sortButtons.forEach(function(button) {
      button.addEventListener('click', this._onSortButtonClick.bind(this));
    }, this);
  },

  _onSortButtonClick: function(event) {
  	var data = event.target.dataset;

    this.sort(data.sortBy, data.sortOrder === 'asc');

    if (data.sortOrder === 'asc') {
      data.sortOrder = 'desc';
      event.target.innerHTML = '&#8595;'
    } else {
      data.sortOrder = 'asc';
      event.target.innerHTML = '&#8593;'
    }
  },

  sort: function(sortBy, asc) {
    this.list = this.list.sort(function(a, b) {
      var result = 0;
      if (a[sortBy] > b[sortBy]) {
        result = -1;
      } else if (a[sortBy] < b[sortBy]) {
        result = 1;
      }

      return asc ? result * -1 : result;
    });

    this.render();
  },

  add: function(person) {
    this.list.push(person);
    this.render();
  },

  remove: function (a, b) {
    this.list.forEach(function(item, index, arr) {
      if (item['firstName'] === a && item['lastName'] === b) {
        arr.splice(index, 1);
      }
    });

    this.render();
  },

  render: function() {
  	this.table.innerHTML = '';
    this.list.forEach(function(item) {
        var row = '<tr>';
        Object.keys(item)
              .forEach(function(key) {
              row += '<td>' + item[key] + '</td>'
          });
        row += '</tr>';
        this.table.innerHTML += row;
  		}, this);
  }
};


function get(url) {
    return new Promise(function(resolve, reject) {
      var xhttp = new XMLHttpRequest();
      xhttp.open("GET", url, true); 
      xhttp.onload = function() {
        if (xhttp.status === 200) {
          resolve(JSON.parse(xhttp.response));
        } else {
          reject(xhttp.statusText);
        }
      };
      xhttp.onerror = function(){
        reject(xhttp.statusText);
      };
      xhttp.send();
    });
}


(function init() {
  document.querySelectorAll('.form-control').forEach(function(input) {
    input.addEventListener('click', resetInput);
  });

  var adultsList;
  var childrenList;

  get('json/children.json').then(function(data) {
    childrenList = new List(document.querySelector('#children'), data);
    return get('json/adults.json').then(function(data) {
      adultsList = new List(document.querySelector('#adults'), data);
    });
  }).catch(function(error) {
    console.log('Error: ', error);
  });

  document.querySelector("#addPerson")
    .addEventListener("click", function() {
      var person = getPersonInfo();

      if (!person) {
        return;
      }

      if (person.age > 18) {
        adultsList.add(person);
      } else {
        childrenList.add(person);
      }

      console.log(adultsList, childrenList);
    });
})();
