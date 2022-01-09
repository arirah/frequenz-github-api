import * as React from 'react';
import { setState, useState, useEffect, memo, useCallback } from 'react';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';

import {
  Text,
  TextInput,
  View,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Card } from 'react-native-paper';
import axios from '../helper/api';

const Item = ({ data }) => (
  <View>
    <Card style={styles.card}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{data.title}</Text>
      <Text style={{}}>Open issues: {data.open_issues}</Text>
      <Text style={{}}>Stars:{data.stars}</Text>
    </Card>
  </View>
);

export default function RepositoryScreen() {
  const [organizations, setOrganizationsList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('react');
  const [selectedItem, setSelectedItem] = useState(null);
  const [minStar, setMinStar] = useState('1');
  const [maxStar, setMaxStar] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPaginateAction] = useState(false);

  const onRefresh = useCallback(() => {
    getOrganizationDate();
    filterData();
    setRefreshing(true);
  }, []);

  const getSuggestions = useCallback(async (q) => {
    setQuery(q);
  }, []);

  useEffect(() => {
    getOrganizationDate();
  }, [query, page, minStar, maxStar]);

  function setItem(item) {
    console.log(item);
  }

  async function getOrganizationDate() {
    setLoading(true);
    await axios
      .get(`&q=${query}+in%3Aname&page=${page}&per_page=10`)
      .then((reponse) => {
        let repos = reponse.data.items.map((repos) => ({
          id: repos.id,
          title: repos.name,
          open_issues: repos.open_issues,
          stars: repos.stargazers_count,
        }));
        console.log('response', repos);
        let orgData = [];
        if (pagination) {
          orgData = organizations.concat(repos);
        } else {
          orgData = repos;
        }
        setOrganizationsList(orgData);
        setLoading(false);
        setRefreshing(false);
        setPaginateAction(false);
      })
      .catch((error) => {
        console.log('Error:', error.response.data);
        setLoading(false);
        setRefreshing(false);
      });
  }

  const renderItem = ({ item }) => <Item data={item} />;

  const renderFooter = () => {
    return ( 
      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator color="#000" style={{ marginLeft: 8 }} />
        ) : null}
      </View>
    );
  };

  function filterData() {
    const result = organizations.filter(
      (repo) => repo.open_issues > minStar && repo.open_issues < maxStar
    );
    setOrganizationsList(result);
  }
  return (
    <View style={styles.container}>
      <View style={styles.autocompleteContainer}>
        <AutocompleteDropdown
          clearOnFocus={false}
          closeOnBlur={true}
          textInputProps={{
            placeholder: 'Start typing...',
          }}
          containerStyle={{ borderWidth: 0, zIndex: 1 }}
          onSelectItem={setSelectedItem}
          dataSet={organizations}
          suggestionsListMaxHeight={Dimensions.get('window').height * 0.3}
          onChangeText={getSuggestions}
          loading={loading}
        />
      </View>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text>Min Issues</Text>
          <TextInput
            keyboardType="numeric"
            value={minStar}
            onChangeText={setMinStar}
            style={styles.input}
          />
        </View>
        <View style={styles.col}>
          <Text>Max Issues</Text>
          <TextInput
            keyboardType="numeric"
            value={maxStar}
            onChangeText={setMaxStar}
            style={styles.input}
          />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <FlatList
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          data={organizations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListFooterComponent={renderFooter}
          onEndReached={() => {
            setPage(page + 1);
            setPaginateAction(true);
          }}
          onEndReachedThreshold={0.5}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#F5FCFF',
    flex: 1,
    flexDirection: 'column',
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 50,
    ...Platform.select({
      web: {
        marginTop: 0,
      },
      default: {
        marginTop: 25,
      },
    }),
  },
  input: {
    height: 35,
    width:'98%',
    margin: 0,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#efefef',
  },
  card: {
    marginBottom: 10,
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    zIndex: 2,
    borderColor: '#fff',
    marginBottom:10
  },
  col: {
    width: '50%',
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 3,
    padding: 5,
  },
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
});
