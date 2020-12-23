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
  const casesTypeColors = {
    cases: {
      hex: "#CC1034",
      rgb: "rgb(204,16,52)",
      half_op: "rgba(204,16,52,0.5)",
      multiplier: 800,
    },

    recovered: {
      hex: "#7dd71d",
      rgb: "rgb(125,215,29)",
      half_op: "rgba(125,215,29,0.5)",
      multiplier: 1200,
    },
    deaths: {
      hex: "#fb4443",
      rgb: "rgb(251,68,67)",
      half_op: "rgba(251,68,67,0.5)",
      multiplier: 2000,
    },
  };
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
  const [casesType, setCasesType] = useState("cases");

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

        countryCode === "Worldwide"
          ? setmapCenter([50.5, 34.5])
          : setmapCenter([data.countryInfo.lat, data.countryInfo.long]);
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
            isRed
            active={casesType === "cases"}
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            cases={prettyPrint(countryInfo.todayCases)}
            total={prettyPrint(countryInfo.cases)}
          />
          <InfoBox
            active={casesType === "recovered"}
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            cases={prettyPrint(countryInfo.todayRecovered)}
            total={prettyPrint(countryInfo.recovered)}
          />
          <InfoBox
            isRed
            active={casesType === "deaths"}
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            cases={prettyPrint(countryInfo.todayDeaths)}
            total={prettyPrint(countryInfo.deaths)}
          />
        </div>

        <Map
          center={mapCenter}
          countries={mapCountries}
          zoom={mapZoom}
          casesType={casesType}
        />
      </div>

      <Card className="app_right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={TableData} />
          <h2 style={{ marginTop: "20px" }}>
            <span style={{ color: casesTypeColors[casesType].hex }}>
              Worldwide New
            </span>
            &nbsp;
            {casesType}
          </h2>
          <LineGraph className="info_graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
