//add gspa
const scriptgsap = document.createElement('script');
scriptgsap.src = './js/gsap.min.js';
scriptgsap.setAttribute('type', 'text/javascript');

let messages = [];
var _speed = 300;
var _gap = 50;
var _ltr = false;
const nickbMethod = () => {
  _onAir = false;
  _counter = 1;
  _stopatcounter = 0;

  const _screen = 1920;
  function start() {
    _onAir = true;
    next();
  }
  window.start = start;

  function stop() {
    _onAir = false;
    // console.log(_counter);
    _stopatcounter = _counter;
  }
  window.stop = stop;

  document
    .getElementById('scroll')
    .getElementsByTagName('text')[0]
    .getElementsByTagName('tspan')[0].textContent = '';
  function next() {
    // let it run to end if not on air
    if (!_onAir) return;
    _counter++;

    var originalGroup = document.getElementById('scroll');
    originalGroup
      .getElementsByTagName('text')[0]
      .getElementsByTagName('tspan')[0].textContent = '';
    const nextDiv = originalGroup.cloneNode(true);

    let nextMsg = messages.shift();
    messages.push(nextMsg);
    nextDiv.setAttribute('id', 'tc' + _counter);
    nextDiv
      .getElementsByTagName('text')[0]
      .getElementsByTagName('tspan')[0].textContent = nextMsg;

    document.getElementsByTagName('svg')[0].appendChild(nextDiv);
    let msgWidth = nextDiv.getBBox().width;
    nextDiv
      .getElementsByTagName('text')[0]
      .getElementsByTagName('tspan')[0]
      .setAttribute('x', _ltr ? -msgWidth : _screen);
    let timeline = gsap.timeline({ paused: true });
    timeline.to('#' + nextDiv.id, {
      duration: getDuration(msgWidth),
      x: _ltr ? _screen + msgWidth : -(_screen + msgWidth),
      ease: 'none',
    });
    timeline.play();
    timeline.eventCallback('onComplete', offScreen, [nextDiv.id]);
    timeline.call(next, [], getNextMsgTime(msgWidth));
  }

  function getDuration(width) {
    let size = _screen + width;
    return size / _speed;
  }

  function getNextMsgTime(width) {
    return (width + (_ltr ? 150 : _gap)) / _speed;
  }

  function offScreen(id) {
    let ticker = document.getElementsByTagName('svg')[0];
    let tickerMsg = document.getElementById(id);
    ticker.removeChild(tickerMsg);
    if (_onAir === false && id === 'tc' + _stopatcounter)
      document
        .getElementsByTagName('svg')[0]
        .removeChild(document.getElementById('scroll_strip'));
  }

  start();
};

async function fetchRSSFeed() {
  const proxyUrl = 'https://octopus-app-gzws3.ondigitalocean.app/fetch-proxy'; // Change this to your server URL
  const rssFeedUrl = 'https://news.google.com/news?pz=1&cf=all&ned=hi_in&hl=hi&output=rss';

  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: rssFeedUrl })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch RSS feed');
    }

    const data = await response.text();
    console.log(data)
    parseRSSFeed(data);
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
  }
}
var aa=[];
function parseRSSFeed(xmlData) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
  const items = xmlDoc.getElementsByTagName('item');

  for (let i = 0; i < items.length; i++) {
     aa.push(items[i].getElementsByTagName('title')[0].textContent);
  }
  messages=aa;
}

scriptgsap.onload = function () {
  fetchRSSFeed()
  nickbMethod();
};
document.body.appendChild(scriptgsap);
