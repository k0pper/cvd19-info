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
    return this.state.liveCountries.map(c => c.CountryCode).indexOf(code);
  }

  fetchDetails(code) {
    const URL = `https://api.covid19api.com/dayone/country/${code}`;
    fetch(URL)
      .then(response => response.json())
      .then(data => {
        this.setState({
          countryHistory: data
        });
      });
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
    let code = this.state.countryHistory[0].CountryCode;

    let totalCases = this.dotSeperated(this.state.countryHistory[this.state.countryHistory.length - 1].Confirmed);
    let activeCases = this.dotSeperated(this.state.countryHistory[this.state.countryHistory.length - 1].Active);
    let deaths = this.dotSeperated(this.state.countryHistory[this.state.countryHistory.length - 1].Deaths);
    let recovered = this.dotSeperated(this.state.countryHistory[this.state.countryHistory.length - 1].Recovered);

    let date = this.state.countryHistory[this.state.countryHistory.length - 1].Date;

    let totalCasesRank = this.getRank(code, "TotalConfirmed");

    return (

      <div className="wrapper">

        <Link to="/">
          <button id="back" className="btn btn-outline-secondary">Go Back</button>
        </Link>

        <div className="details-header col-lg-12">
          <h1 class="details-heading">COVID-19 Information: {this.state.countryHistory[0].Country}</h1>
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
