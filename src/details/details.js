import React from 'react'
import './details.css'
import loading from '../loading.svg';
import * as moment from 'moment'
import { Link } from 'react-router-dom';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: window.innerHeight,
      width: window.innerWidth,
      countryHistory: [],
      liveCountries: []
    }

    this.updateDimensions = this.updateDimensions.bind(this);
  }



  componentDidMount() {
    const code = this.props.match.params.countryCode;
    this.fetchDetails(code);
    this.fetchSummary();
    window.addEventListener("resize", this.updateDimensions);
  }

  getTotalRank(code) {
    this.state.liveCountries.sort((a, b) => {
      return a["TotalConfirmed"] < b["TotalConfirmed"] ? 1 : -1
    });
    return this.state.liveCountries.map(c => c.CountryCode).indexOf(code) + 1;
  }

  getActiveRank(code) {
    this.state.liveCountries.sort((a, b) => {
      return (a.TotalConfirmed - a.TotalRecovered - a.TotalDeaths) <
        (b.TotalConfirmed - b.TotalRecovered - b.TotalDeaths) ? 1 : -1;
    });
    return this.state.liveCountries.map(c => c.CountryCode).indexOf(code) + 1;
  }

  getDeathRank(code) {
    this.state.liveCountries.sort((a, b) => {
      return a.TotalDeaths < b.TotalDeaths ? 1 : -1;
    });
    return this.state.liveCountries.map(c => c.CountryCode).indexOf(code) + 1;
  }

  fetchDetails(code) {
    if (code.toLowerCase() !== 'us') {
      const URL = `https://api.covid19api.com/dayone/country/${code}`;
      fetch(URL)
        .then(response => response.json())
        .then(data => {
          data = data.filter((c) => { return c["Province"].length === 0 });
          this.setState({
            countryHistory: data
          });
        })

    }
    else if (code.toLowerCase() === 'us') {
      const US_URL = 'https://api.covidtracking.com/v1/us/daily.json';
      fetch(US_URL)
        .then(response => response.json())
        .then((responseArray) => {
          responseArray = responseArray
            .map((c) => {
              return {
                Active: c.positive - c.death - c.recovered,
                Confirmed: c.positive,
                Deaths: c.death,
                Recovered: c.recovered,
                Date: c.lastModified,
                Province: ""
              }
            })
          this.setState({
            countryHistory: responseArray
          })
        })
    }
  };

  fetchSummary() {
    const URL = `https://api.covid19api.com/summary`;
    fetch(URL)
      .then(response => response.json())
      .then(data => {
        this.setState({
          liveCountries: data.Countries
        })
      });
  }

  dotSeperated(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  updateDimensions() {
    this.setState({
      height: window.innerHeight,
      width: window.innerWidth
    });
  }

  getChartWidth() {
    if (this.state.width > 1000) return "70%";
    else if (this.state.width <= 800) return "100%"
  }

  getAspectRatio() {
    if (this.state.width > 1000) return 21.0 / 9.0
    else if (this.state.width <= 800) return 16.0 / 12.0
  }

  formatXAxis(tickItem) {
    return moment(tickItem).format('MMM D')
  }

  formatYAxis(cases) {
    cases = Math.round(cases / 1000) * 1000
    if (cases >= 1000 && cases <= 999999) {
      return cases / 1000 + "K";
    } else if (cases >= 1000000) {
      return cases / 1000000 + "M"
    } else {
      return cases;
    }
  }

  tooltipFormatter(tickItem) {
    return moment(tickItem).format('MMM Do YYYY')
  }

  getXTicks(data) {
    var ticks = []
    ticks.push(data[0]["Date"])
    for (var i = 1; i < data.length - 2; i += 3) {
      var percentageChange = (data[i + 1]["Total Cases"] / data[i]["Total Cases"]) - 1;
      var absoluteChange = (data[i + 1]["Total Cases"] - data[i]["Total Cases"]);
      if ((percentageChange > 0.1 && absoluteChange > 1000) || absoluteChange > 5000) {
        ticks.push(data[i]["Date"]);
      }
    }
    ticks.push(data[data.length - 1]["Date"])
    return ticks;
  }

  renderHistory() {
    const code = this.props.match.params.countryCode;

    let country = this.state.liveCountries.find((c) => { return c.CountryCode === code })

    let totalCases = this.dotSeperated(country.TotalConfirmed)
    let deaths = this.dotSeperated(country.TotalDeaths)
    let recovered = this.dotSeperated(country.TotalRecovered)
    let activeCases = this.dotSeperated(country.TotalConfirmed - country.TotalRecovered - country.TotalDeaths)

    let date = country.Date
    let totalCasesRank = this.getTotalRank(code);
    let activeCasesRank = this.getActiveRank(code);
    let deathRank = this.getDeathRank(code);

    var data = this.state.countryHistory;

    var size = data.length - 1;

    data = this.state.countryHistory
      .map((c) => {
        return {
          "Date": moment(c.Date.split('T')[0], "YYYY-M-D").valueOf(),
          "Total Cases": c.Confirmed,
          "Active Cases": c.Active,
          "Recovered": c.Recovered,
          "Deaths": c.Deaths
        }
      })
      .sort((a, b) => {
        return a["Date"] > b["Date"] ? 1 : -1
      });



    return (

      <div className="wrapper">

        <div className="details-header row">

          <div class="col-lg-1 col-md-12 col-sm-12 text-lg-center text-md-center text-sm-center text-center">
            <Link to="/">
              <button id="back" className="btn btn-outline-secondary">Go Back</button>
            </Link>
          </div>

          <div class="col-lg-1 col-md-12 col-sm-12 vertical-align-center text-lg-center text-md-center text-center">
            <img alt={`Country Flag`} src={`https://www.countryflags.io/${code}/shiny/64.png`}></img>
          </div>

          <div className="col-lg-10 col-md-12 col-sm-12 vertical-align-center text-lg-left text-md-center text-center">
            <h1 className="details-heading">COVID-19 Information: {country.Country}</h1>
            <p className="data-origin">Data from {moment(date).format('LL')}</p>
          </div>

        </div>



        <div className="Details col-lg-9 col-md-9 col-sm-10">

          <div className="row">

            <div className="TotalCases col-lg-12 col-md-12 col-sm-12">
              <h1>Total Cases</h1>
              <h2>{totalCases} (# {totalCasesRank})</h2>
            </div>

            <div className="TotalCases col-lg-12 col-md-12 col-sm-12">
              <ResponsiveContainer width={this.getChartWidth()} aspect={this.getAspectRatio()}>

                <LineChart width={600} height={300} data={data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="Date" name="Date" tickFormatter={this.formatXAxis} ticks={this.getXTicks(data)} tick={{ fontSize: 12 }} />
                  <Tooltip labelFormatter={this.tooltipFormatter} className="opa" />
                  <YAxis type="number" dataKey="Total Cases" tickFormatter={this.formatYAxis} tick={{ fontSize: 12 }} domain={[0, data[data.length - 1]["Total Confirmed"]]} />
                  <Line type="monotone" dataKey="Total Cases" stroke="black" dot={{ r: 0 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Active Cases" stroke="red" dot={{ r: 0 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Recovered" stroke="green" dot={{ r: 0 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Deaths" stroke="brown" dot={{ r: 0 }} activeDot={{ r: 8 }} />
                  <Legend />
                </LineChart>

              </ResponsiveContainer>

            </div>

            <div className="ActiveCases col-lg-4 col-md-6 col-sm-12">
              <h1>Active Cases</h1>
              <h2 className="pulsate">{activeCases} (# {activeCasesRank})</h2>
            </div>

            <div className="Deaths col-lg-4 col-md-6 col-sm-12">
              <h1>Total Deaths</h1>
              <h2>{deaths} (# {deathRank}) </h2>
            </div>

            <div className="Recovered col-lg-4 col-md-6 col-sm-12">
              <h1>Recovered</h1>
              <h2>{recovered}</h2>
            </div>


          </div>
        </div>
      </div>
    )
  }

  render() {
    const { countryHistory, liveCountries } = this.state;
    return countryHistory.length && liveCountries.length ? this.renderHistory() : (
      <div className="wrapper">
        <Link to="/">
          <button id="back" className="btn btn-outline-secondary">Go Back</button>
        </Link>
        <div className="Details">
          <img alt="Loading ..." width="150" src={loading}></img>
          <h1>Loading ...</h1>
          <p>Loading forever? This country is propably not available</p>
        </div>
      </div>

    )
  }
}
