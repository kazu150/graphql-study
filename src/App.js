import React, { Component } from 'react';
import { ApolloProvider } from 'react-apollo';
import { Query } from 'react-apollo';
import client from './client';
import { SEARCH_REPOSITORIES } from './graphql';

const StarButton = props => {
  const totalCount =props.node.stargazers.totalCount;
  const starUnit = totalCount !== 1 ? "stars" : "star";
  return (
    <button>
      {totalCount} {starUnit}
    </button>
  )
}

const PER_PAGE = 5;
const DEFAULT_STATE = {
  first: PER_PAGE,
  last: null,
  after: null,
  before: null,
  query: "フロントエンドエンジニア"
}

class App extends Component {
  constructor(props){
    super(props);
    this.state = DEFAULT_STATE;
    this.handleChange= this.handleChange.bind(this)
  }

  handleChange(event){
    this.setState({
      ...DEFAULT_STATE,
      query: event.target.value
    })
  }

  goNext(search) {
    this.setState({
      first: PER_PAGE,
      after: search.pageInfo.endCursor,
      last:null,
      before: null
    })
  }

  render(){
    const { query, first, last, before, after } = this.state;
    console.log(query)
    return (
      <ApolloProvider client={client}>
        <form>
          <input value={query} type="text" onChange={this.handleChange} />
        </form>
        <Query 
          query={SEARCH_REPOSITORIES} 
          variables={{ query, first, last, before, after }}
        >
          {
            ({ loading, error, data }) => {
              if(loading) return 'Loading...';
              if(error) return `Error! ${error.message}`;
              console.log(data)
              const search = data.search;
              const repositoryCount = search.repositoryCount;
              const repositoryUnit = repositoryCount  !== 1 ? "Repositories": "Repository"; 
              const title = `GitHub Repositories Search Results - ${repositoryCount} ${repositoryUnit}`
              return (
                <>
                  <h3>{title}</h3>
                  <ul>
                    {search.edges.map((edge) => {
                      const node = edge.node
                      return (
                        <li key={node.id}>
                          <a href={node.url} target="_blank" rel="noreferrer">{node.name}</a>
                          &nbsp;
                          <StarButton node={node} />
                        </li>
                      )
                    })}
                  </ul>
                  {search.pageInfo.hasNextPage && <button onClick={() => this.goNext(search)}>Next</button>}
                </>
              )
            }
          }
        </Query>
      </ApolloProvider>
    )
  }
}

export default App;
