'use strict';

const partialSelectors = ['default', 'select'];

const compare = (a, b) => {
  return b.count - a.count;

}

const makeInvisible = (elem) => {
  if (!elem.classList.contains('invisible')) {
    elem.classList.add('invisible')
  }
}

const fillInput = (value) => {
  const cityInput = document.getElementById('select-cities'),
  closeButton = cityInput.querySelector('.close-button');

  cityInput.value = value;
  closeButton.classList.remove()
}

const fillList = (partialSelector) => {
  const list = document.querySelector(`.dropdown-lists__list--${partialSelector}>.dropdown-lists__col`);

  for (let item of cities["RU"]) {
    const countryBlock = document.createElement('div');
    countryBlock.classList.add('dropdown-lists__countryBlock');

    const countryTotalLine = document.createElement('div');
    countryTotalLine.classList.add('dropdown-lists__total-line');

    countryTotalLine.innerHTML = ` <div class="dropdown-lists__country">${item.country}</div>
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

    list.appendChild(countryBlock);
    //list.classList.add('invisible');
    list.addEventListener('click', (event) => {


      let target = event.target.closest('.dropdown-lists__total-line');

      if (target) {
        partialSelectors.forEach((partialSelector) => {
          const list = document.querySelector(`.dropdown-lists__list--${partialSelector}`);
          list.classList.toggle('invisible');

          if (partialSelector === 'select') {
            const blocks = list.querySelectorAll('.dropdown-lists__countryBlock');

            blocks.forEach((block) => {
              block.classList.remove('invisible');

              if (block.querySelector('.dropdown-lists__country').textContent != target.querySelector('.dropdown-lists__country').textContent) {
                block.classList.add('invisible');
              }
              //line
            });
          }
        });
      }
    });
  }
}


let cities;

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
    cities = response;
    console.log(cities);

    partialSelectors.forEach((item) => fillList(item));
  })
  .catch((error) => {
    console.log(error);
});

const cityInput = document.getElementById('select-cities');

cityInput.addEventListener('click', () => {
  const defaultList = document.querySelector('.dropdown-lists__list--default');

  defaultList.classList.remove('invisible');
});

cityInput.addEventListener('input', (event) => {
  const defaultList = document.querySelector('.dropdown-lists__list--default'), 
        selectList = document.querySelector('.dropdown-lists__list--select'),
        autocompleteList = document.querySelector('.dropdown-lists__list--autocomplete'),
        target = event.target;
        col = autocompleteList.querySelector('.dropdown-lists__col');

  makeInvisible(selectList);
  col.innerHTML = '';

  if (target.value === '') {    
    makeInvisible(autocompleteList);
    defaultList.classList.remove('invisible');
  } else {
    autocompleteList.classList.remove('invisible');

    makeInvisible(defaultList);

    let fittingCities = [],
        regexp = new RegExp(`^${target.value}`, 'ig');

    for (let item of cities.RU) {
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