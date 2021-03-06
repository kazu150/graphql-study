import React, { Component } from 'react';
import { ApolloProvider, Mutation, Query } from 'react-apollo';
import client from './client';
import { SEARCH_REPOSITORIES, ADD_STAR, REMOVE_STAR } from './graphql';

const StarButton = props => {
  const {node, query, first, last, before, after} = props;
  const totalCount = node.stargazers.totalCount;
  const starUnit = totalCount !== 1 ? "stars" : "star";
  const viewerHasStarred = node.viewerHasStarred;
  const StarStatus = ({addOrRemoveStar}) => {
    return(
      <button onClick={() => {
        addOrRemoveStar({
          variables: {input: { starrableId: node.id }},
            update: (store, {data: {addStar, removeStar}}) => {
              const { starrable } = addStar || removeStar;
              const data = store.readQuery({
                query: SEARCH_REPOSITORIES,
                variables: { query, first, last, after, before}
              })
              const edges = data.search.edges
              const newEdges = edges.map(edge => {
                if(edge.node.id === node.id){
                  const totalCount = edge.node.stargazers.totalCount;
                  const diff = starrable.viewerHasStarred ? -1 : 1;
                  const newTotalCount = totalCount + diff;
                  edge.node.stargazers.totalCount = newTotalCount;
                }
                return edge;
              })
              data.search.edges = newEdges;
              store.writeQuery({ query: SEARCH_REPOSITORIES, data})
            }
        })
      }}>
        {totalCount} {starUnit} | {viewerHasStarred ? "starred" : "-"}
      </button>
    )
  }

  return (
    <Mutation mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR} >
      {
        addOrRemoveStar => <StarStatus addOrRemoveStar={addOrRemoveStar} />
      }
    </Mutation>
  )
}

const PER_PAGE = 5;
const DEFAULT_STATE = {
  first: PER_PAGE,
  last: null,
  after: null,
  before: null,
  query: ""
}

class App extends Component {
  constructor(props){
    super(props);
    this.state = DEFAULT_STATE;
    this.myRef = React.createRef();
  }

  handleSubmit = (event) => {
    console.log(event)
    event.preventDefault();
    this.setState({
      query: this.myRef.current.value
    })
  }

  goPrevios(search) {
    this.setState({
      first: null,
      after: null,
      last:PER_PAGE,
      before: search.pageInfo.startCursor
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
    return (
      <ApolloProvider client={client}>
        <form>
          <input ref={this.myRef} />
          <input type="submit" value="submit" onClick={this.handleSubmit} />
        </form>
        <Query 
          query={SEARCH_REPOSITORIES} 
          variables={{ query, first, last, before, after }}
        >
          {
            ({ loading, error, data }) => {
              if(loading) return 'Loading...';
              if(error) return `Error! ${error.message}`;
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
                          <StarButton node={node} {...{query, first, last, before, after}} />
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
