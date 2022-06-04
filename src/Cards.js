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
    columnData as defaultColumnData,
    columnSelectors as defaultColumnSelectors,
    conn,
    dbName
} from "./helpers/constants";

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

const defaultQuery = `SELECT ?type ?name ?id ?category ?text ?image {
    ?subject a ?type ;
    :id ?id ;
    :name ?name ;
    :category ?category ;
    :desc ?text ;
    :image ?image.
?type rdfs:subClassOf :Card .
OPTIONAL { ?card :image ?image }.
}`;

class Cards extends Component {
    componentDidMount() {
        this.refreshData();
  }
    
  refreshData() {
      this.setState({
          dataState: TableDataAvailabilityStatus.LOADING
      });

      query.execute(conn, dbName, defaultQuery).then(res => {
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
    
  getBindingsFormattedForTable(bindings) {

      const bindingsById = bindings.reduce((groupedBindings, binding) => {
      const { value: id } = binding.id;
      groupedBindings[id] = groupedBindings[id] ? groupedBindings[id].concat(binding) : [binding];
      return groupedBindings;
      }, {});

      return Object.keys(bindingsById)
      .map(id => parseInt(id, 10)) 
      .sort() 
      .map(id => {
          return bindingsById[id].reduce(
          (bindingForTable, binding) => {
              const bindingValues = Object.keys(binding).reduce((valueBinding, key) => {
              const { type, value } = binding[key];
              valueBinding[key] = type !== "uri" ? value : value.slice(value.lastIndexOf("/") + 1); // data cleanup
              return valueBinding;
              }, {});
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
            {defaultColumnSelectors.map(selector => (
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
        const columnHeaders = defaultColumnData.map(({ label }) => <TableCell key={label}>{label}</TableCell>)
        const { dataState, data } = this.state;
        const isLoading = dataState === TableDataAvailabilityStatus.LOADING;

        return (
            <div className="Cards" style={styles.appInnerContainer}>
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

export default Cards;