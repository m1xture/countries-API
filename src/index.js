import debounce from 'lodash.debounce';
import func from 'lodash/fp/debounce';
import swal from 'sweetalert';
const refs = {
  inputEl: document.querySelector('[data-input]'),
  tipsEl: document.querySelector('[data-tips]'),
  cardEl: document.querySelector('.card'),
};

const { inputEl, tipsEl, cardEl } = refs;

function showTips(arr) {
  tipsEl.innerHTML = '';
  arr.forEach(countryName => {
    tipsEl.insertAdjacentHTML(
      'beforeend',
      `<li class=tips__item><p class=tips__text>${countryName}</p></li>`
    );
  });
  return;
}

class Country {
  constructor({ name: { common }, capital, population, languages, flags }) {
    this.countryName = common;
    this.capital = capital.join(', ');
    this.population = population;
    this.languages = Object.values(languages).join(', ');
    this.flag = flags.png;
    this.flagAlt = flags.alt;
  }
  renderCountry() {
    cardEl.innerHTML = `<img src=${this.flag} alt=${this.flagAlt} class="card__img" />
      <h2 class="card__title">${this.countryName}</h2>
      <p class="card__text"><b>Capital:</b> ${this.capital}</p>
      <p class="card__text"><b>Population:</b> ${this.population}</p>
      <p class="card__text"><b>Languages:</b> ${this.languages}</p>`;
  }
}

tipsEl.addEventListener('click', e => {
  function setInputValue(text) {
    inputEl.value = text;
    tipsEl.innerHTML = '';
    inputEl.dispatchEvent(new Event('input'));
  }
  if (e.target.nodeName === 'LI') {
    setInputValue(e.target.firstElementChild.textContent);
  }
  if (e.target.nodeName === 'P') {
    setInputValue(e.target.textContent);
  }
});

inputEl.addEventListener(
  'input',
  debounce(evt => {
    const currentCountry = inputEl.value.trim();
    if (currentCountry === '') {
      return;
    }
    fetch(`https://restcountries.com/v3.1/name/${currentCountry}`)
      .then(response => {
        if (!response.ok) {
          swal('Error', response.code, 'error');
          throw new Error(response.status);
        }
        return response.json();
      })
      .then(data => {
        if (data.length === 0) {
          swal('Error', 'There is no such county', 'error');
          return;
        }
        if (data.length > 1) {
          showTips(data.map(country => country.name.common));
          return;
        }
        new Country(data[0]).renderCountry();
      })
      .catch(err => {
        swal('Error', 'You probably entered an invalid country', 'error');
        throw new Error(err.status);
      });
  }, 500)
);
