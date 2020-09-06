import React,{ Component } from 'react';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import classNames from 'classnames';


import './App.css';
import {
  DEFAULT_QUERY,
  DEFAULT_PAGE,
  DEFAULT_HPP,
  PATH_BASE,
  PATH_SEARCH,
  PARAM_SEARCH,
  PARAM_PAGE,
  PARAM_HPP,
  } from '../constants';


// const isSearched = (searchTerm) => 
//   (item) => !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
  };

class App extends Component {
  constructor(props) { 
  super(props);
  this.state = { 
    results: null, 
    searchKey: '',
    searchTerm: DEFAULT_QUERY, 
    isLoading: false,
  };
  this.needsToSearchTopstories = this.needsToSearchTopstories.bind(this);
  this.setSearchTopstories = this.setSearchTopstories.bind(this); 
  this.fetchSearchTopstories = this.fetchSearchTopstories.bind(this);
  this.onSearchChange=this.onSearchChange.bind(this);
  this.onDismiss = this.onDismiss.bind(this); 
  this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }
  
  needsToSearchTopstories(searchTerm) {
    return !this.state.results[searchTerm];
  }
  setSearchTopstories(result) {
    const { hits, page } = result;
    const { searchKey, results } = this.state;
    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : [];
    const updatedHits = [ ...oldHits, ...hits ];

    this.setState({ 
      results: { 
      ...results,
        [searchKey]:{
          hits:updatedHits,
          page
        },
        isLoading: false 
      } 
    });   
  }
  fetchSearchTopstories(searchTerm, page) { 
    this.setState({ isLoading: true });
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
    .then(response => response.json())
    .then(result => this.setSearchTopstories(result)); 
  }
  componentDidMount() {
    const {
      searchTerm
    } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);  

  }
  onSearchSubmit(event) {
    const { 
      searchTerm 
    } = this.state; 
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
    if (this.needsToSearchTopstories(searchTerm)) {
      this.fetchSearchTopstories(searchTerm, DEFAULT_PAGE);
    }   
    event.preventDefault();
  }

  onDismiss(id) {
    console.log('ondismiss is called')
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey]; 
    const isNotId = item => item.objectID !== id; 
    const updatedHits = hits.filter(isNotId);
    this.setState({
      results: {
        ...results, 
        [searchKey]: { 
          hits: updatedHits, 
          page 
        } 
      } 
    })
    console.log('ondismiss call is finished')

  }
  onSearchChange(event){
    this.setState({
      searchTerm:event.target.value,
    })
  }
  render() {
    const { searchTerm, results,searchKey,isLoading} = this.state;
    const page = (results &&
      results[searchKey] &&
      results[searchKey].page) || 0;
    const list = (
        results &&
        results[searchKey] &&
        results[searchKey].hits
      ) || [];
    return(
      <div className="page">
        <div className='interactions'>
          <Search 
            value={searchTerm} 
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit} 
          >
            Search
          </Search>
        </div> 
        <Table 
          list={list} 
          onDismiss={this.onDismiss} 
        />
        <div className="interactions">
        <ButtonWithLoading
          isLoading={isLoading}
          onClick={() => this.fetchSearchTopstories(searchKey, page + 1)}>
          More
        </ButtonWithLoading>
        </div>
      </div>
    );
  }
}
const Search= ({ value, onChange,onSubmit, children})=>{
  let input;
  return(
    <form onSubmit={onSubmit}> 
        {children} 
      <input 
        type="text" 
        value={value} 
        onChange={onChange} 
        ref={(node) => input = node}
      /> 
      <button type="submit">{children}</button>
      
    </form> 
  )
}


class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortKey: 'NONE',
      isSortReverse: false,
    };
    this.onSort = this.onSort.bind(this);
  }
  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }
  render() {
    const {
      list,
      onDismiss
    } = this.props;
    const {
      sortKey,
      isSortReverse,
      } = this.state;
    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse
      ? sortedList.reverse()
      : sortedList;

    return(
    <div className='table'> 
      <div className="table-header">
        <span style={{ width: '40%' }}>
          <Sort sortKey={'TITLE'}
                onSort={this.onSort}
                activeSortKey={sortKey}
          >
            Title
          </Sort>
        </span>
        <span style={{ width: '30%' }}>
          <Sort
            sortKey={'AUTHOR'}
            onSort={this.onSort}
            activeSortKey={sortKey}
          >
            Author
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          <Sort
            sortKey={'COMMENTS'}
            onSort={this.onSort}
            activeSortKey={this.sortKey}
          >
            Comments
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          <Sort
            sortKey={'POINTS'}
            onSort={this.onSort}
            activeSortKey={sortKey}
          >
            Points
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          Archive
        </span>
      </div>
      { reverseSortedList.map(item => 
        <div key={item.objectID} className='table-row'> 
          <span style={{ width: '40%' }}>  
            <a href={item.url}>{item.title}</a> 
          </span> 
          <span  style={{ width: '30%' }}>{item.author}</span> 
          <span style={{ width: '10%' }}> {item.num_comments}</span> 
          <span style={{ width: '10%' }}> {item.points}</span>
          <span style={{ width: '10%' }}>  
            <Button onClick={() => onDismiss(item.objectID)}  
              className='button-inline'
            > Dismiss </Button> 
          </span> 
        </div> 
      )} 
    </div> 
  )}
}

const Button =({onClick,className,children})=> (
  <button
    onClick={onClick}
    className={className}
    type='button'
  >
    {children}
  </button>
)
const Loading = () =>
<div>Loading ...</div>

const withLoading = (Component) => ({ isLoading, ...rest }) =>
isLoading ? <Loading /> : <Component { ...rest } />

const ButtonWithLoading = withLoading(Button);
const Sort = ({ sortKey, onSort, children,activeSortKey }) =>{
  const sortClass = classNames(
    'button-inline',
    { 'button-active': sortKey === activeSortKey }
    );
    return (
      <Button
      onClick={() => onSort(sortKey)}
      className={sortClass}
      >
        {children}
      </Button>
    );
}
Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
Button.defaultProps = {
  className: '',
  };
Table.propTypes = {
  list: PropTypes.arrayOf(
  PropTypes.shape({
  objectID: PropTypes.string.isRequired,
  author: PropTypes.string,
  url: PropTypes.string,
  num_comments: PropTypes.number,
  points: PropTypes.number,
  })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
  };
export default App;
export {
  Button,
  Search,
  Table,
  };
