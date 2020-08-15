import React from 'react';
import './select-country.css';

import { DropdownButton } from 'react-bootstrap'
import { Dropdown } from 'react-bootstrap'


export default class CountriesDropdown extends React.Component {
  URL = "https://api.covid19api.com/countries";

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      countries: [],
      selectedCountryCode: '',
      input: '',
      ready: false,
    }
    this.handleSelect = this.handleSelect.bind(this);
  }

  componentWillMount() {
    fetch(this.URL)
      .then(res => res.json())
      .then((data) => {
        this.setState({
          countries: data,
          ready: true
        });
      })
  }


  toFullName(countryCode) {
    var country = this.state.countries.find((c) => {
      return c.ISO2 === countryCode;
    })
    return country.Country;
  }


  handleSelect(event) {
    this.state = {
      ...this.state,
      selectedCountryCode: event
    };
    this.setState({
      ...this.state
    });
    this.props.onSelectCountry(this.state.selectedCountryCode);
  }

  onChangeHandler(e) {
    this.setState({
      input: e.target.value,
    })
  }

  getDropDownlabel() {
    return this.state.selectedCountryCode ? this.toFullName(this.state.selectedCountryCode) : "Select Country";
  }

  render() {
    var countries = this.state.countries;

    countries = countries.filter((c) => { return c.Country.toLowerCase().includes(this.state.input.toLowerCase()) })

    return (
      <div>
        <DropdownButton id="dropdown-item-button" title={this.getDropDownlabel()} onSelect={($event) => this.handleSelect($event)}>
          <input placeholder="Search..." className="form-control Search" onChange={this.onChangeHandler.bind(this)} />
          {countries.sort((c1, c2) => { return c1.Country > c2.Country ? 1 : (-1) }).map((country, index) => {
            return (
              <div className="flex-wrapper" key={country.ISO2}              >
                <img alt="flag" height="35" src={`https://www.countryflags.io/${country.ISO2}/flat/32.png`} style={{ flex: 2 }}></img>
                <Dropdown.Item
                  eventKey={country.ISO2}
                  as="button"
                  style={{ height: 25, flex: 16 }}>
                  {country.Country} ({country.ISO2})
                </Dropdown.Item>
              </div>
            )
          })}
        </DropdownButton>
      </div >
    );
  }
}
