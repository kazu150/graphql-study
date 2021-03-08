import { ApolloProvider } from 'react-apollo';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import client from './client';

const ME = gql`
  query me {
    user(login: "kazu150"){
      name
      avatarUrl
    }
  }
`;

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        hi
      </div>
      <Query query={ME}>
        {
          ({ loading, error, data }) => {
            if(loading) return 'Loading...';
            if(error) return `Error! ${error.message}`;

            return (
              <>
              <div>{data.user.name}</div>
              <img src={data.user.avatarUrl} />
              </>
            )
          }
        }
      </Query>
    </ApolloProvider>
  );
}

export default App;
