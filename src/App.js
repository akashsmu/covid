import "./App.css";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import { useEffect, useState } from "react";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import { sortData as sortedData, prettyPrint } from "./util";
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("Worldwide");
  const [countryInfo, setCountryInfo] = useState([]);
  const [TableData, setTableData] = useState([]);
  const [mapCenter, setmapCenter] = useState({
    lat: 34.8076,
    lng: -40.4796,
  });
  const [mapZoom, setmapZoom] = useState(3);
  const [mapCountries, setmapCountries] = useState([]);
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));

          const sortData = sortedData(data);
          setTableData(sortData);
          setmapCountries(data);
          setCountries(countries);
        });
    };
    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url =
      countryCode === "Worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setCountry(countryCode);
        setCountryInfo(data);

        setmapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setmapZoom(6);
      });
  };

  return (
    <div className="app">
      <div className="app_left">
        <div className="app_header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app_dropdown">
            <Select
              variant="outlined"
              value={country}
              onChange={onCountryChange}>
              <MenuItem value="Worldwide">WorldWide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="app_stats">
          <InfoBox
            title="Coronavirus Cases"
            cases={prettyPrint(countryInfo.todayCases)}
            total={countryInfo.cases}
          />
          <InfoBox
            title="Recovered"
            cases={prettyPrint(countryInfo.todayRecovered)}
            total={countryInfo.recovered}
          />
          <InfoBox
            title="Deaths"
            cases={prettyPrint(countryInfo.todayDeaths)}
            total={countryInfo.deaths}
          />
        </div>

        <Map
          center={mapCenter}
          countries={mapCountries}
          casesType="recovered"
          zoom={mapZoom}
        />
      </div>

      <Card className="app_right">
        <CardContent style={{ height: "100%" }}>
          <h3>Live Cases by Country</h3>
          <Table countries={TableData} />
          <h3>{country}</h3>
          <LineGraph />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
