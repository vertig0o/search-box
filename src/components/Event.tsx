import axios from "axios";
import React, { ChangeEvent, useEffect, useState } from "react";
import "./Event.css";
interface Country {
  id: number;
  name: string;
  code: string;
  currency: string;
}

interface GroupedCountry {
  group: any;
  items: Country[];
}

function Event() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [groupedCountries, setGroupedCountries] = useState<GroupedCountry[]>(
    []
  );

  const RowTemplate = (country: Country) => {
    return (
      <tr
        key={country.code}
        className={
          selectedCodes.indexOf(country.code) >= 0 ? "selected-row" : ""
        }
      >
        <td>
          <input
            type="checkbox"
            checked={selectedCodes.indexOf(country.code) >= 0}
            onChange={() => {
              const index = selectedCodes.indexOf(country.code);
              var array = [...selectedCodes];
              if (index >= 0) {
                array.splice(index, 1);
              } else {
                array.push(country.code);
              }
              setSelectedCodes(array);
            }}
          ></input>
        </td>
        <td>{country.name}</td>
        <td>{country.code}</td>
        <td>{country.currency}</td>
      </tr>
    );
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    let search = inputValue;
    let group = "";
    if (inputValue.includes("group:")) {
      if (
        inputValue.includes("search:") &&
        inputValue.indexOf("search:") > inputValue.indexOf("group:")
      ) {
        group = inputValue
          .substring(
            inputValue.indexOf("group:") + 6,
            inputValue.indexOf("search:")
          )
          .trim();
      } else {
        group = inputValue.substring(inputValue.indexOf("group:") + 6).trim();
      }
      search = "";
    }
    if (inputValue.includes("search:")) {
      if (
        inputValue.includes("group:") &&
        inputValue.indexOf("group:") > inputValue.indexOf("search:")
      ) {
        search = inputValue
          .substring(
            inputValue.indexOf("search:") + 7,
            inputValue.indexOf("group:")
          )
          .trim();
      } else {
        search = inputValue.substring(inputValue.indexOf("search:") + 7).trim();
      }
    }
    console.log(search);
    console.log(group);

    const filtered = countries.filter(
      (country) =>
        !search ||
        country.name.toLowerCase().includes(search.toLowerCase()) ||
        country.code.toLowerCase().includes(search.toLowerCase())
    );
    try {
      if (group && group != "") {
        const getGroupValue: any = (obj: any, group: string) => {
          if (group.includes(".")) {
            return getGroupValue(
              obj[group.substring(0, group.indexOf("."))],
              group.substring(group.indexOf(".") + 1)
            );
          } else {
            var result = obj[group];
            if (typeof result == "object" || typeof result == "function")
              return null;
            return result;
          }
        };
        let groups = filtered
          .map((x: any) => getGroupValue(x, group))
          .filter(
            (value, index, array) => value && array.indexOf(value) === index
          );
        if (groups.length > 0) {
          const grouped: GroupedCountry[] = [];
          groups.forEach((item) => {
            var items = filtered.filter(
              (x: any) => getGroupValue(x, group) == item
            );

            grouped.push({
              group: item,
              items: items,
            });
          });

          setGroupedCountries(grouped);
          setFilteredCountries([]);
          return;
        }
      }
    } catch {}
    setFilteredCountries(filtered);
    setGroupedCountries([]);
  };

  useEffect(() => {
    axios
      .post("https://countries.trevorblades.com/graphql", {
        operationName: "Query",
        query:
          "query Query{ countries {code name currency continent {code name }} }",
      })
      .then((response) => {
        setCountries(response.data.data.countries);
        setFilteredCountries(response.data.data.countries);
        if (response.data.data.countries.length > 10) {
          setSelectedCodes([response.data.data.countries[9].code]);
        } else {
          setSelectedCodes([
            response.data.data.countries[
              response.data.data.countries.length - 1
            ].code,
          ]);
        }
      })
      .catch((error) => {
        console.error("Data Error", error);
      });
  }, []);

  return (
    <div>
      <h2>Countries</h2>

      <input
        className="inp"
        type="text"
        placeholder="search:un group:currency"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <div className="p-2">
        <table className="customers">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Code</th>
              <th>Currency</th>
            </tr>
          </thead>
          <tbody>
            {groupedCountries.length > 0
              ? groupedCountries.map((group) => (
                  <React.Fragment key={group.group}>
                    <tr>
                      <td className="text-left" colSpan={4}>
                        <b> Group: {group.group}</b>
                      </td>
                    </tr>

                    {group.items.map((item) => RowTemplate(item))}
                  </React.Fragment>
                ))
              : filteredCountries.map((country) => RowTemplate(country))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Event;
