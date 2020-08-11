import React from 'react';
import './App.css';
import CountriesDropdown from './select-country/select-country'
import { Link } from 'react-router-dom'

class App extends React.Component {
  state = { countryCode: '' }

  constructor(props) {
    super(props);
    this.handleSelectedCountry = this.handleSelectedCountry.bind(this);
  }

  handleSelectedCountry(fullCountryCode) {
    this.setState({ countryCode: fullCountryCode });
  }

  renderInfoButton() {
    return this.state.countryCode !== '' ?
      (<button id="getInfo" type="button" className="btn btn-outline-primary">Get Information</button>) :
      (<div></div>)
  }

  render() {
    return (
      <div className="App">
        <h1>Get COVID-19 Information</h1>
        <p>Select your Country and get Basic Information about the state of the COVID-19 Virus.</p>
        <p><b>Note</b>: Some Countries may not be available.</p>
        <p>Contact me: <a href="https://instagram.com/k.opper">Alex M.<img alt="(Instagram)" width="15px" src="https://image.flaticon.com/icons/png/512/174/174855.png" /></a>  </p>
        <CountriesDropdown onSelectCountry={this.handleSelectedCountry} />
        <Link to={`/details/${this.state.countryCode}`}>
          {this.renderInfoButton()}
        </Link>
      </div>
    );
  }
}

export default App;
