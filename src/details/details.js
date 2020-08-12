import React from 'react'
import './details.css'
import loading from '../loading.svg';
import * as moment from 'moment'
import { Link } from 'react-router-dom';

export default class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      countryHistory: [],
      liveCountries: []
    }
  }



  componentDidMount() {
    const code = this.props.match.params.countryCode;
    this.fetchDetails(code);
    this.fetchSummary();
  }

  getRank(code, attribute) {
    let sorted = this.state.liveCountries.sort((a, b) => {
      return a[attribute] < b[attribute] ? 1 : -1
    });
    return this.state.liveCountries.map(c => c.CountryCode).indexOf(code) + 1;
  }

  fetchDetails(code) {
    if (code.toLowerCase() != 'us') {
      const URL = `https://api.covid19api.com/dayone/country/${code}`;
      fetch(URL)
        .then(response => response.json())
        .then(data => {
          this.setState({
            countryHistory: data
          });
        });
    }
    else if (code.toLowerCase() == 'us') {
      const US_URL = 'https://api.covidtracking.com/v1/us/daily.json';
      fetch(US_URL)
        .then(response => response.json())
        .then((responseArray) => {
          responseArray = responseArray.map((c) => {
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

  renderHistory() {
    const code = this.props.match.params.countryCode;

    let country = this.state.liveCountries.find((c) => { return c.CountryCode == code })

    let totalCases = this.dotSeperated(country.TotalConfirmed)
    let deaths = this.dotSeperated(country.TotalDeaths)
    let recovered = this.dotSeperated(country.TotalRecovered)
    let activeCases = this.dotSeperated(country.TotalConfirmed - country.TotalRecovered - country.TotalDeaths)

    let date = country.Date
    let totalCasesRank = this.getRank(code, "TotalConfirmed");

    // let countryHistory = this.state.countryHistory.filter((entry) => entry.Province === "")
    // let totalCases = this.dotSeperated(countryHistory[countryHistory.length - 1].Confirmed);
    // let activeCases = this.dotSeperated(countryHistory[countryHistory.length - 1].Active);
    // let deaths = this.dotSeperated(countryHistory[countryHistory.length - 1].Deaths);
    // let recovered = this.dotSeperated(countryHistory[countryHistory.length - 1].Recovered);
    // let date = countryHistory[countryHistory.length - 1].Date;
    // let totalCasesRank = this.getRank(code, "TotalConfirmed");

    return (

      <div className="wrapper">

        <Link to="/">
          <button id="back" className="btn btn-outline-secondary">Go Back</button>
        </Link>

        <div className="details-header col-lg-12">
          <h1 className="details-heading">COVID-19 Information: {country.Country}</h1>
          <img alt={`Country Flag`} src={`https://www.countryflags.io/${code}/shiny/64.png`}></img>
          <p>Data from {moment(date).format('LL')}</p>
          <hr />
        </div>



        <div className="Details col-lg-6 col-md-9 col-sm-10">

          <div className="row">
            <div className="TotalCases col-lg-12 col-md-6 col-sm-12">
              <h1>Total Cases</h1>
              <h2>{totalCases} (# {totalCasesRank})</h2>
            </div>

            <div className="ActiveCases col-lg-4 col-md-6 col-sm-12">
              <h1>Active Cases</h1>
              <h2 className="pulsate">{activeCases}</h2>
            </div>

            <div className="Deaths col-lg-4 col-md-6 col-sm-12">
              <h1>Total Deaths</h1>
              <h2>{deaths}</h2>
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
