'use strict';

const partialSelectors = ['default', 'select'],
      cityInput = document.getElementById('select-cities'),
      closeButton = document.querySelector('.close-button'),
      defaultList = document.querySelector('.dropdown-lists__list--default'), 
      selectList = document.querySelector('.dropdown-lists__list--select'),
      autocompleteList = document.querySelector('.dropdown-lists__list--autocomplete'),
      button = document.querySelector('.button'),
      allLists = document.querySelectorAll('.dropdown-lists__list'),
      mainCountryMap = {
        "RU": "Россия",
        "EN": "United Kingdom",
        "DE": "Deutschland"
      };

class CookieManager {
  getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  deleteCookie(name) {
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

}

const askLocale = () => {
  locale = prompt('Введите локаль - RU, EN или DE');

  if (!availableLocales.includes(locale.toLowerCase())) {
    askLocale();
  }
}

const fillList = (partialSelector) => {
  const list = document.querySelector(`.dropdown-lists__list--${partialSelector}>.dropdown-lists__col`);

  for (let item of cities) {
    const countryBlock = document.createElement('div');
    countryBlock.classList.add('dropdown-lists__countryBlock');

    const countryTotalLine = document.createElement('div');
    countryTotalLine.classList.add('dropdown-lists__total-line');

    countryTotalLine.innerHTML = `<div class="dropdown-lists__country">${item.country}</div>
                            <div class="dropdown-lists__count">${item.count}</div>`;

    countryBlock.appendChild(countryTotalLine);

    item.cities = item.cities.sort(compare);

    const limit = partialSelector === 'default' ? 3 : item.cities.length;

    for (let i = 0; i < limit; i++) {
      const totalLine = document.createElement('div');
      totalLine.classList.add('dropdown-lists__line');

      totalLine.innerHTML = `<div class="dropdown-lists__city">${item.cities[i].name}</div>
                             <div class="dropdown-lists__count">${item.cities[i].count}</div>`;

      countryBlock.appendChild(totalLine);
    }

    if (item.country === mainCountryMap[locale]) {
      list.prepend(countryBlock);
    } else {
      list.appendChild(countryBlock);
    }
    //list.classList.add('invisible');
    list.addEventListener('click', (event) => {
      let target = event.target.closest('.dropdown-lists__total-line');

      if (target) {
        let selectedCountry = target.querySelector('.dropdown-lists__country').textContent;

        mode = selectList.classList.contains('invisible') ? 0 : (defaultList.classList.contains('invisible') ? 1 : -1);

        defaultList.style.left = '0%';
        defaultList.style.right = '0%';
        selectList.style.left = '0%';
        selectList.style.right = '0%';
        animationFrame = animateLists(mode, 0);

        if (mode === 0) {
          const blocks = selectList.querySelectorAll('.dropdown-lists__countryBlock');

          blocks.forEach((block) => {
            block.classList.remove('invisible');

            if (block.querySelector('.dropdown-lists__country').textContent != selectedCountry) {
              block.classList.add('invisible');
            }
            //line
          });
        }

        fillInput(selectedCountry);
      } else if (event.target.closest('.dropdown-lists__line')) {
        let selectedCity = event.target.closest('.dropdown-lists__line').querySelector('.dropdown-lists__city').textContent;
        fillInput(selectedCity);
        let link = getLinkByCity(selectedCity);

        const button = document.querySelector('.button');
        button.href = link;
      }
    });
  }
}

const compare = (a, b) => {
  return b.count - a.count;
}

const makeInvisible = (elem) => {
  if (!elem.classList.contains('invisible')) {
    elem.classList.add('invisible')
  }
}

const fillInput = (value) => {
  cityInput.value = value;
  cityInput.focus();
  closeButton.classList.remove('invisible');
}

const getLinkByCity = (cityName) => {
  for (let item of cities) {
    for (let city of item.cities) {
      if (city.name === cityName) {
        return city.link;
      }
    }
  }

  return '';
}

const availableLocales = ['ru', 'en', 'de'];
let locale,
    cities = null;

const cookieManager = new CookieManager();

locale = cookieManager.getCookie("locale");

if (locale === '') {
  askLocale();
  locale = locale.toUpperCase();
  cookieManager.setCookie("locale", locale, 10000);
} else {
  if (localStorage[locale] !== undefined) {
    cities = JSON.parse(localStorage[locale]);
    partialSelectors.forEach((item) => fillList(item));
  }
}



let animationFrame,
    mode = 0;


if (cities === null) {
  fetch('db_cities.json', {
    method: "GET", 
    headers: {
      'Content-Type': 'application/json'
    }})
    .then((response) => {
      if (response.status !== 200) {
        throw new Error(`Что-то пошло не так, код ошибки - ${response.status}`);
      }

      return response.json()
    })
    .then((response) => {
      cities = response[locale];
      localStorage[locale] = JSON.stringify(cities);
      partialSelectors.forEach((item) => fillList(item));
    })
    .catch((error) => {
      console.log(error);
  });
}

cityInput.addEventListener('click', () => {
  const defaultList = document.querySelector('.dropdown-lists__list--default'),
        autocompleteList = document.querySelector('.dropdown-lists__list--autocomplete');

        if (autocompleteList.classList.contains('invisible')) {
          defaultList.classList.remove('invisible');
        }
});

cityInput.addEventListener('input', (event) => {
  const target = event.target,
        col = autocompleteList.querySelector('.dropdown-lists__col');

  makeInvisible(selectList);
  col.innerHTML = '';

  if (target.value === '') {    
    makeInvisible(autocompleteList);
    defaultList.classList.remove('invisible');
    closeButton.classList.add('invisible');
  } else {
    autocompleteList.classList.remove('invisible');

    makeInvisible(defaultList);

    let fittingCities = [],
        regexp = new RegExp(`^${target.value}`, 'ig');

    for (let item of cities) {
      for (let city of item.cities) {
        if (regexp.test(city.name)) {
          fittingCities.push(city);
        }
      }
    }

    if (fittingCities.length !== 0) {
      for (let city of fittingCities) {
        const cityLine = document.createElement('div');
        cityLine.classList.add('dropdown-lists__line');

        cityLine.innerHTML = `<div class="dropdown-lists__city">${city.name}</div>
                              <div class="dropdown-lists__count">${city.count}</div>`;

        col.append(cityLine);
      }
    } else {
      const cityLine = document.createElement('div');
      cityLine.classList.add('dropdown-lists__line');

      cityLine.innerHTML = `<div class="dropdown-lists__city">Ничего не найдено</div>`;

      col.append(cityLine);
    }
  }
});

closeButton.addEventListener('click', (event) => {
  cityInput.value = '';
  button.href = '#';
  event.target.classList.add('invisible');
  allLists.forEach((item) => makeInvisible(item));
});

const animateLists = (mode, counter) => {

  let firstElement, secondElement;

  if (mode < 0) {
    return;
  } else if (mode === 0) {
    firstElement = defaultList;
    secondElement = selectList;
  } else {
    firstElement = selectList;
    secondElement = defaultList;
  }

  counter+=2;
  firstElement.style.left = `${counter}%`;
  secondElement.style.right = `${100 - counter}%`;
    

  if (counter < 100) {
    animationFrame = requestAnimationFrame(animateLists.bind(null, mode, counter));
  } else {        
    secondElement.classList.remove('invisible');
    makeInvisible(firstElement);
    cancelAnimationFrame(animationFrame);
  }
};