import { React, useState } from 'react'
import { Line } from 'react-chartjs-2'
import  'chart.js/auto'
import data from './assets/data.json'
import averages from './assets/averages.json'
// import './App.css'
import './App.scss'

// Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title)


function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])

  const handleInputChange = (e) => {
    const inputValue = e.target.value
    setQuery(inputValue)

    // Filter and set suggestions based on the input
    const filteredSuggestions = data
      .filter((item) => item.oppilaitoksen_nimi.toLowerCase().startsWith(inputValue.toLowerCase()) || item.kunta_nimi.toLowerCase().startsWith(inputValue.toLowerCase()))
      .map((item) => [item.oppilaitoksen_nimi, item.kunta_nimi].join(', '))

    setSuggestions(filteredSuggestions)
  }

  const handleSuggestionClick = (suggestion) => {
    setQuery('') // Set query
    setSuggestions([]) // Clear suggestions
    onSearch(suggestion.split(', ')) // Pass data to parent component (App.jsx
  }

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleInputChange}
      />
      <div className="suggestions-container">
        {suggestions.length === 0 && query.length > 0 ? (
          <p>No such item</p>
        ) : (
          <ul className="suggestions">
            {suggestions.map((suggestion, index) => (
              <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}



const LineChart = ({ result }) => {
  const chartData = {
    labels: [2019, 2020, 2021, 2022, '2023 (estimation)', '2024 (plan)', '2025 (plan)'], 
    datasets: [
      {
        label: 'Total expenditure per resident, €',
        data: [result.Toimintamenot19, result.Toimintamenot20, result.Toimintamenot21, result.Toimintamenot22, result.Toimintamenot23, result.Toimintamenot24, result.Toimintamenot25],
        fill: false,
        tension: 0.1
      },
      {
        label: 'Average total expenditure per resident, €',
        data: [averages[0].Toimintamenot, averages[1].Toimintamenot, averages[2].Toimintamenot, averages[3].Toimintamenot, averages[4].Toimintamenot, averages[5].Toimintamenot, averages[6].Toimintamenot],
        fill: false,
        tension: 0.1
      }],
  }

  const config = {
    type: 'line',
    data: chartData,
    }

  return (
    <div className="line-chart">
      <Line data={chartData} options={config} />
    </div>
  )
}



// create a table that contains ka_pitka, pred, suomi_s2_osuus, koulutus, tyollisyys, asukkaiden_mediaanitulo
function Koulu({ result }) {
  var ka_pitka = (result.ka_pitka == null) ? '-' : Number(result.ka_pitka).toFixed(2)
  var pred = (result.pred == null) ? '-' : Number(result.pred).toFixed(2)
  var koulutus = (result.koulutus == null) ? '-' : Number(result.koulutus * 100).toFixed()
  var tyollisyys = (result.tyollisyys == null) ? '-' : Number(result.tyollisyys * 100).toFixed()
  var asukkaiden_mediaanitulo = (result.asukkaiden_mediaanitulo == null) ? '-' : (Number(result.asukkaiden_mediaanitulo) / 12).toFixed()
  return (
    <div className="koulu">
      <table>
        <tbody>
          <tr>
            <th>The average grade of school-leaving certificate in 2022</th>
            <th>The predicted average grade for 2023</th>
            <th>Pupils who speak Finnish as a second language</th>
          </tr>
          <tr>
            <td>{ka_pitka}</td>
            <td>{pred}</td>
            <td>{result.suomi_s2_osuus * 100} %</td>
          </tr>
          <tr>
            <th>The tertiery-educated of the region</th>
            <th>Employment of the region</th>
            <th>Median income of the region, net/month</th>
          </tr>
          <tr>
            <td>{koulutus} %</td>
            <td>{tyollisyys} %</td>
            <td>{asukkaiden_mediaanitulo} €</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function Kunta ({ result }) {
  var opetus_total = (result.opetus_total == null) ? '-' : Number(result.opetus_total).toFixed(2)
  var opetus_ratio = (result.opetus_ratio == null) ? '-' : Number(result.opetus_ratio * 100).toFixed(2)
  var opetus_rank = (result.opetus_rank == null) ? '-' : Number(result.opetus_rank).toFixed()
  var opetus_ratio_rank = (result.opetus_ratio_rank == null) ? '-' : Number(result.opetus_ratio_rank).toFixed()
  return (
    <div className="kunta">
      <table>
        <tbody>
          <tr>
            <th>Expenditure on education per resident in 2022 (ranking out of 292 municipalities)</th>
            <th>The proportion of expenditure on education in 2022 (ranking out of 292 municipalities)</th>
          </tr>
          <tr>
            <td>{opetus_total} € ({opetus_rank} / 292)</td>
            <td>{opetus_ratio} % ({opetus_ratio_rank} / 292)</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function SearchResult({ result }) {
  return (
    <div className="search-results">
      <div className="search-result">
        <h2>School: {result.oppilaitoksen_nimi}</h2>
        <Koulu result={result} />
        <h2>Municipality: {result.kunta_nimi}</h2>
        <Kunta result={result} />
      </div>
    </div>
  )
}


function App() {
  const [searchResult, setSearchResult] = useState([])

  const handleSearch = (result) => {
    const filteredResults = data.filter((item) => item.oppilaitoksen_nimi.toLowerCase().startsWith(result[0].toLowerCase()) && item.kunta_nimi.toLowerCase().startsWith(result[1].toLowerCase()))
    setSearchResult(filteredResults[0])
  }

  return (
    <div>
      <h1>School Engine with Local Finance</h1>
        <p>Yle, the Finnish Braodcasting Company, unveiled <a href='https://yle.fi/a/74-20018233'><em>the School Engine (Koulukone)</em></a> in February 2023.
        This minimalist-designed search tool allows you to explore your primary school in Finland and gain insights into various aspects, including
        the average school-leaving certificate grades, the percentage of pupils with Finnish as a second language in the school (S2 pupils),
        as well as other social and economic indicators of the school's surrounding region.
        Furthermore, schools within a municipality are ranked based on the average grades and the percentages of S2 pupils.</p>
        <p>The School Engine sparked heated debates on social media. 
        <a href='https://twitter.com/Opetushallitus/status/1626532367077629955?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed%7Ctwterm%5E1626532367077629955%7Ctwgr%5Eda56fac577aaf7bf61b96270dec031c53b1806e6%7Ctwcon%5Es1_&ref_url=https%3A%2F%2Fembed.sanoma-sndp.fi%2Fext%2Fembed%2F%3Furl%3Dhttps3A2F2Ftwitter.com2FOpetushallitus2Fstatus2F1626532367077629955'>
        Finnish National Agency for Education (Opetushallitus)</a> revealed that they have requested Yle not to release the tool.
        The former Minister of Education, <a href='https://twitter.com/liandersson/status/1626511828246208512?ref_src=twsrc%5Etfw%7Ctwcamp%5Etweetembed%7Ctwterm%5E1626518450653765632%7Ctwgr%5Ed6fefab46d113c850bf8cf2b88c54aca9686f51a%7Ctwcon%5Es2_&ref_url=https%3A%2F%2Fembed.sanoma-sndp.fi%2Fext%2Fembed%2F%3Furl%3Dhttps3A2F2Ftwitter.com2Fliandersson2Fstatus2F1626518450653765632'>
        Li Andersson</a>, also criticised the school engine, describing it as "truly sad." <a href='https://yle.fi/a/74-20018712'>Jouko Jokinen</a>, the Editor-in-Chief at Yle, 
        emphasised the significance of fact-based journalism and expressed their willingness to delve into similar statistics for kindergartens.</p>
        <p>This school engine represents my endeavour as a budding data science student to enhance Yle's school engine by integrating publicly available
        finincial data of municipalities. Through this tool, you can access information such as your school's average school-leaving certificate grades, 
        the percentage of S2 pupils, the rate of tertiary education completion among local residents, the employment statistics in the area, 
        the median income of the region, and the local government's expenditures on education. Additionally, it offers predictions 
        for the average 2023 school-leaving certificate grades based on historical data.
        </p>
      <h3>About the data</h3>
        <p>The average grade, the proportion of pupils who speak Finnish as a second language, the proportion of tertiery-educated residents, the employment and the median income
        were obtained from Yle's original school engine by web-scraping. The financial data of municipalities were downloaded from <a href='https://www.tutkihallintoa.fi/'>
        tutkihallintoa.fi</a>. 
        </p>
      <h3>About the author</h3>
      <p>Hibiki Ito received a BSc degree with honours in mathematics from the University of Helsinki. 
      He is currently an MSc student in data science at the same university, working on applied computer science with educational perspective.
      (ORCID: <a href="https://orcid.org/0000-0002-1558-8818">
      <img alt="ORCID logo" src="https://info.orcid.org/wp-content/uploads/2019/11/orcid_16x16.png" width="16" height="16" />
      0000-0002-1558-8818
      </a>)
      </p>
      <div className='school-engine'>
        <SearchBar onSearch={handleSearch} />
        <SearchResult result={searchResult} />
        <LineChart result={searchResult}/>
      </div>
    </div>
  )
}

export default App
