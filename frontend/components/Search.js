import React, { useState } from "react";
import Downshift, { resetIdCounter } from "downshift";
import { ApolloConsumer } from "react-apollo";
import gql from "graphql-tag";
import debounce from "lodash.debounce";
import { DropDown, DropDownTeam, SearchStyles } from "./styles/DropDown";

const SEARCH_TEAMS_QUERY = gql`
  query SEARCH_TEAMS_QUERY($searchTerm: String!) {
    teams(where: [{ name_contains: $searchTerm }]) {
      id
      name
    }
  }
`;

const SEARCH_PLAYERS_QUERY = gql`
  query SEARCH_PLAYERS_QUERY($searchTerm: String!) {
    players(where: [{ summonerName_contains: $searchTerm }]) {
      id
      summonerName
    }
  }
`;

function AutoComplete({ type }) {
  const [names, setNames] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  resetIdCounter();

  const onChange = debounce(async (e, client) => {
    console.log("Searching. . .");
    //turn on loading.
    setLoading(true);
    //Manually query apollo client.
    const res = await client.query({
      query: type === "players" ? SEARCH_PLAYERS_QUERY : SEARCH_TEAMS_QUERY,
      variables: { searchTerm: e.target.value }
    });
    setNames(type === "players" ? res.data.summonerNames : res.data.names);
    setLoading(false);
  }, 350);

  return (
    <SearchStyles>
      <Downshift itemToString={item => (item === null ? "" : item.name)}>
        {({
          getInputProps,
          getTeamProps,
          isOpen,
          inputValue,
          highlightedIndex
        }) => (
          <div>
            <ApolloConsumer>
              {client => (
                <input
                  {...getInputProps({
                    type: "search",
                    placeholder:
                      type === "players" ? "Summoner Name" : "Team Name",
                    id: "search",
                    className: loading ? "loading" : "",
                    onChange: e => {
                      e.persist();
                      onChange(e, client);
                    }
                  })}
                />
              )}
            </ApolloConsumer>
            {isOpen && (
              <DropDown>
                {names.map((team, index) => (
                  <DropDownTeam
                    {...getTeamProps({ team })}
                    key={team.id}
                    highlighted={index === highlightedIndex}
                  />
                ))}
                {!names.length && loading && (
                  <DropDownTeam>
                    No {type === "players" ? "player" : "team"} found for{" "}
                    {inputValue}
                  </DropDownTeam>
                )}
              </DropDown>
            )}
          </div>
        )}
      </Downshift>
    </SearchStyles>
  );
}

export default AutoComplete;
