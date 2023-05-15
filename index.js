const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const cheerio = require("cheerio");
const axios = require("axios");

const app = express();

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname));

var flight_data = {
    flights: []
};

async function performScraping(url) {

    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
            }
        });
        const $ = cheerio.load(response.data);

        const flights = $("#kp-wp-tab-AIRFARES > div.TzHB6b.cLjAic.LMRCfc > div > div > div:nth-child(2) > div > div:nth-child(2) > div:nth-child(5) > div > div > a");
        flights.each(function(){
            fname = $(this).find("span.ps0VMc").text();
            fprice = $(this).find("span.xqqLDd > span").text();

            flight_data.flights.push({ fname, fprice });
        });
    }
    catch (error) {
        console.error(error);
    }

}

app.get('/', (req, res) => {
    res.json({ message: "hello from server" });
});

app.post('/', (req, res) => {

    flight_data.flights = [];

    const url = "https://www.google.com/search?q="+req.body.source+"+to+"+req.body.destination+"+flights+"+req.body.date+"&rlz=1C1CHBD_enIN922IN922&sxsrf=APwXEdeC-0_QY6a9l25fKdxGB9nECqM3uA%3A1684031110842&ei=hkZgZND7Mq_z4-EPiaqEuAc&ved=0ahUKEwjQ1pvh4PP-AhWv-TgGHQkVAXcQ4dUDCBA&uact=5&oq=delhi+to+jaipur+flights&gs_lcp=Cgxnd3Mtd2l6LXNlcnAQAzIECCMQJzIFCAAQgAQyCggAEIAEEBQQhwIyBQgAEIAEMgUIABCABDIGCAAQFhAeMgYIABAWEB4yBggAEBYQHjIGCAAQFhAeMgYIABAWEB46CggAEEcQ1gQQsANKBAhBGABQvAVY_wZg4AloAXABeACAAaoBiAHPApIBAzAuMpgBAKABAcgBCMABAQ&sclient=gws-wiz-serp";
    
    async function scraping() {
        await performScraping(url);
        res.json(flight_data);
    }
    scraping();

});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});