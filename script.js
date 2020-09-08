const baseURL = 'https://api.openweathermap.org/data/2.5/weather';
const APIKEY = 'ce9bc0667a6253b447fd1faff590ee65';
const api2 = '3e4a53abcd9a2d0cca343c015f0c3e6b&units=metric';
const imgSrcBase ='http://openweathermap.org/img/wn/';

let city = '';
//set weather to api
const displayWeather = (data) => {
    const weatherElement = document.querySelector('.weather');
    city = data.name;
    console.log(data);
    const html = `       
    <h1><span>${data.name},${data.sys.country}</span></h1>
    <img src="${`${imgSrcBase}/${data.weather[0].icon}@2x.png`}" alt="weather"/>
    <h2>Current Weather: <span>${data.main.temp} &deg;</span></h2>
    <h3>Description: <span>${data.weather[0].description} </span> </h3>
    <h4>Sunrise: <span>${parseTime(data.sys.sunrise)}</span></h3>
    <h4>Sunset: <span>${parseTime(data.sys.sunset)}</span></h3>`

    weatherElement.innerHTML = html;
}

const parseTime = (seconds) => {
    return new Date(seconds *1000).toLocaleTimeString('it-IT');
}

//fetch weather data 
startApp = async (pos) => {
    try {
        // console.log(`${baseURL}?lat=${pos.latitude}&lon=${pos.longitude}$appid=${APIKEY}`);
        const response = await fetch(`${baseURL}?lat=${pos.latitude}&lon=${pos.longitude}&appid=${APIKEY}&units=metric`);
        const data = await response.json();
        displayWeather(data);

    } catch (err) {
        console.log(err);
    }
}

//start finding by lat
getLocation = () => {
    const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function success(pos) {
        let crd = pos.coords;
        startApp(crd);
    }

    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        ask({
            title: 'Please  confirm location and refresh \n or search for a city '
        })
    }
    return navigator.geolocation.getCurrentPosition(success, error, options);
}

//events 
const onSearchSubmitHandler = async (e) => {
    e.preventDefault();

    const cityName = e.target.parentElement.city.value;
    if (city.toLocaleLowerCase() === cityName.toLocaleLowerCase()) {
        ask({
            title: `You already searched ${cityName} `
        });
        return;
    } else if (cityName.length < 2) {
        ask({
            title: 'Invalid Input'
        });
        return;
    }


    // api.openweathermap.org/data/2.5/weather?q={city name}&appid={your api key}
    try {
        const response = await fetch(`${baseURL}?q=${cityName}&appid=${APIKEY}&units=metric`);
        const data = await response.json();
        if (data.cod != 200) {
            console.log(data.message);
            return;
        }
        displayWeather(data);

    } catch (err) {
        console.log(err);
    }

}


////////////////////////////////////////////////////////////////////////////

function wait(ms = 0) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//destroy popup completely
async function destroyPopup(popup) {
    popup.classList.remove('open');
    await wait(1000);
    // remove the popup entirely!
    popup.remove();
    /* eslint-disable no-param-reassign */
    popup = null;
    /* eslint-enable no-param-reassign */
}



//creates popup with given question options
function ask(options) {
    return new Promise(async function (resolve) {
        // First we need to create a popup with all the fields in it
        const popup = document.createElement('form');
        popup.classList.add('popup');
        popup.insertAdjacentHTML(
            'afterbegin',
            `<fieldset>
            <label>Error: '${options.title}'</label>
            <button type="submit">OK</button>
          </fieldset>
        `
        );

        // check if they want a cancel button
        if (options.cancel) {
            const skipButton = document.createElement('button');
            skipButton.type = 'button';
            skipButton.textContent = 'Cancel';
            popup.firstElementChild.appendChild(skipButton);
            // TODO: listen for a click on that cancel button
            skipButton.addEventListener(
                'click',
                function () {
                    resolve(null);
                    destroyPopup(popup);
                }, {
                    once: true
                }
            );
        }
        // listen for the submit event on the inputs
        popup.addEventListener(
            'submit',
            function (e) {
                e.preventDefault();
                console.log('Error resolved');
                resolve('ok');
                // remove it from the DOM entirely
                destroyPopup(popup);
            }, {
                once: true
            }
        );
        // when someone does submit it, resolve the data that was in the input box!

        // insert that popup into the DOM
        document.body.appendChild(popup);
        // put a very small timeout before we add the open class

        await wait(50);
        popup.classList.add('open');
    });
}
//main
getLocation();
document.querySelector('form button').addEventListener('click', onSearchSubmitHandler);