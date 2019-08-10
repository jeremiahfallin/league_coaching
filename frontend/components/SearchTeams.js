import React, { useState } from "react";
import Downshift, { resetIdCounter } from "downshift";
import { ApolloConsumer } from "react-apollo";
import gql from "graphql-tag";
import debounce from "lodash.debounce";
import { DropDown, DropDownTeam, SearchStyles } from "./styles/DropDown";

const SEARCH_TEAMS_QUERY = gql`
  query SEARCH_TEAMS_QUERY($searchTerm: String!) {
    team(where: [{ name_contains: $searchTerm }]) {
      id
      name
    }
  }
`;

function AutoComplete({ searchTeamName }) {
  const [teamNames, setTeamNames] = useState([]);
  const [loading, setLoading] = useState(false);

  onChange = debounce(async (e, client) => {
    console.log("Searching. . .");
    //turn on loading.
    setLoading(true);
    //Manually query apollo client.
    const res = await client.query({
      query: SEARCH_TEAMS_QUERY,
      variables: { searchTerm: e.target.value }
    });
    setTeamNames(res.data.teams);
    setLoading(false);
  }, 350);
  return (
    <SearchStyles>
      <Downshift
        onChange={routeToItem}
        teamToString={team => (team === null ? "" : team.name)}
      >
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
                    placeholder: "Team Name",
                    id: "search",
                    className: loading ? "loading" : "",
                    onChange: e => {
                      e.persist();
                      this.onChange(e, client);
                    }
                  })}
                />
              )}
            </ApolloConsumer>
            {isOpen && (
              <DropDown>
                {teamNames.map((team, index) => (
                  <DropDownTeam
                    {...getTeamProps({ team })}
                    key={team.id}
                    highlighted={index === highlightedIndex}
                  />
                ))}
                {!teamNames.length && loading && (
                  <DropDownTeam> Nothing found for {inputValue}</DropDownTeam>
                )}
              </DropDown>
            )}
          </div>
        )}
      </Downshift>
    </SearchStyles>
  );
}
