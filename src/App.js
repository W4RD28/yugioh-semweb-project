import { query } from "stardog";

import React, { Component } from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import CircularProgress from '@material-ui/core/CircularProgress';
import {
    TableDataAvailabilityStatus,
    columnData,
    columnSelectors,
    conn,
    dbName
} from "./helpers/constants";

// Let's not take _quite_ the entire browser screen.
const styles = {
    appInnerContainer: {
        width: "90%",
        margin: "20px auto 0"
    },
    paper: {
        overflowX: "auto"
    },
    spinner: {
        margin: "20px auto",
        display: "block"
    }
};

const columnHeaders = columnData.map(({ label }) => <TableCell key={label}>{label}</TableCell>);

const readQuery = `SELECT ?type ?name ?id ?category ?text ?image {
      ?subject a ?type ;
      :id ?id ;
      :name ?name ;
      :category ?category ;
      :desc ?text ;
      :image ?image.
  ?type rdfs:subClassOf :Card .
  OPTIONAL { ?subject :image ?image }
}`;

class App extends Component {
  componentDidMount() {
    this.refreshData();
  }
    
  refreshData() {
      this.setState({
          dataState: TableDataAvailabilityStatus.LOADING
      });
      query.execute(conn, dbName, readQuery).then(res => {
          if (!res.ok) {
          this.setState({
              dataState: TableDataAvailabilityStatus.FAILED
          });
          return;
      }

          const { bindings } = res.body.results;
          const bindingsForTable = this.getBindingsFormattedForTable(bindings);

          this.setState({
              dataState: TableDataAvailabilityStatus.LOADED,
              data: bindingsForTable
          });
      });
  }
    
  // Our SPARQL query returns a new "row" (i.e., variable binding) for each
  // character for each category in which the character appears. We don't want to
  // _display_ multiple rows for the same character, though. Instead, we want
  // to show _one_ row for each character, and, if the character was in several
  // categories, we want to show them as a group within that character's single row. This
  // method goes through the bindings, groups them under each individual
  // character's id, then merges them together, aggregating the categories as an
  // array of strings. It also cleans up some of the data so that it's more
  // readable in the UI.
  getBindingsFormattedForTable(bindings) {
      // Group the bindings by each character id, in case multiple rows were
      // returned for a single character.
      const bindingsById = bindings.reduce((groupedBindings, binding) => {
      const { value: id } = binding.id;
      groupedBindings[id] = groupedBindings[id] ? groupedBindings[id].concat(binding) : [binding];
      return groupedBindings;
      }, {});
    
      // Sort the bindings by id (ascending), then, if there are multiple
      // bindings for a single id, merge them together, aggregating categories as an
      // array.
      return Object.keys(bindingsById)
      .map(id => parseInt(id, 10)) // convert ids from strings to numbers for sorting
      .sort() // we do this sorting client-side because `Object.keys` ordering is not guaranteed
      .map(id => {
          // For each `id`, merge the bindings together as described above.
          return bindingsById[id].reduce(
          (bindingForTable, binding) => {
              // Quick cleanup to remove IRI data that we don't want to display:
              const bindingValues = Object.keys(binding).reduce((valueBinding, key) => {
              const { type, value } = binding[key];
              valueBinding[key] = type !== "uri" ? value : value.slice(value.lastIndexOf("/") + 1); // data cleanup
              return valueBinding;
              }, {});
              // Aggregate categories on the `categories` property, deleting `category`:
              const categories = bindingValues.category
              ? bindingForTable.categories.concat(bindingValues.category)
              : bindingForTable.categories;
              delete bindingValues.category;
              return {
              ...bindingForTable,
              ...bindingValues,
              categories
              };
          },
          { categories: [] }
          );
      });
  }

    constructor(props) {
        super(props);
        this.state = {
            dataState: TableDataAvailabilityStatus.NOT_REQUESTED,
            data: []
        };
    }

    getBindingValueForSelector(selector, binding) {
        const bindingValue = binding[selector === "category" ? "categories" : selector];
        // NOTE: In a production app, we would probably want to do this formatting elsewhere.
        return Array.isArray(bindingValue) ? bindingValue.join(", ") : bindingValue;
    }

    renderRowForBinding(binding, index) {
        return (
        // Use every "selector" to extract table cell data from each binding.
        <TableRow key={binding.id}>
            {columnSelectors.map(selector => (
                selector === "image" ?
                <TableCell key={selector}>
                    <img src={this.getBindingValueForSelector(selector, binding)} alt="card"/>
                </TableCell>
                :
                <TableCell key={selector}>
                    {this.getBindingValueForSelector(selector, binding)}
                </TableCell>
            ))}
        </TableRow>
        );
    }

    render() {
        const { dataState, data } = this.state;
        const isLoading = dataState === TableDataAvailabilityStatus.LOADING;

        return (
            <div className="App" style={styles.appInnerContainer}>
                <CssBaseline />
                <Paper style={styles.paper}>
                <Toolbar>
                    <Typography variant="title">
                        Yugioh with Stardog
                    </Typography>
                </Toolbar>
                {isLoading ? <CircularProgress style={styles.spinner} /> : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columnHeaders}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((binding, index) => this.renderRowForBinding(binding, index))}
                        </TableBody>
                    </Table>
                    )}
                    </Paper>
            </div>
        );
    }
}

export default App;