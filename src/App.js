import './App.css';
import React from 'react';
function groupBy(objects, property) {
    // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
    // value for property (obj[property])
    if(typeof property !== 'function') {
        const propName = property;
        property = (obj) => obj[propName];
    }

    const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
    for(const object of objects) {
        const groupName = property(object);
        //Make sure that the group exists
        if(!groupedObjects.has(groupName)) {
            groupedObjects.set(groupName, []);
        }
        groupedObjects.get(groupName).push(object);
    }

    // Create an object with the results. Sort the keys so that they are in a sensible "order"
    const result = {};
    for(const key of Array.from(groupedObjects.keys()).sort()) {
        result[key] = groupedObjects.get(key);
    }
    return result;
}


function getDatamuseSimilarToUrl(ml) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'ml': ml})).toString()}`;
}
function getDatamuseRhymeUrl(rel_rhy) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'rel_rhy': rel_rhy})).toString()}`;
}
function Save(props) {
  let saved =<p></p>;
    if(props.save.length == 0) {
        saved=<p>Saved Words: (none)</p>
      }else{
        saved=<p>Saved Words: {props.save.join(',')}</p>
      }
  return(
      <div>
        {saved}
      </div>
  )
}
class SaveButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {is_clicked:false}
    this.saveHandler = this.saveHandler.bind(this);
  }
  saveHandler(){
    if(!this.state.is_clicked){
      this.setState({is_clicked:true});
      this.props.clickHandler(this.props.word);
    }
  }
  render(){
    return(
      <div>
        {this.props.word}<button onClick={this.saveHandler}>{this.state.is_clicked?"saved":"save"}</button>
      </div>
    )
  }
}
class Result extends React.Component {
  constructor(props) {
    super(props);
    this.state = {items:[],is_loaded:false};
  }
  clickHandler(word){
    this.props.onSave(word);
  }
  componentDidUpdate(prevProps) {
  // Typical usage (don't forget to compare props):
    if (this.props.result !== prevProps.result) {
    fetch(this.props.is_rhythm?getDatamuseRhymeUrl(this.props.result):getDatamuseSimilarToUrl(this.props.result))
        .then((response) => response.json())
        .then((data) => {
            this.setState({
              items:data,
              is_loaded:true});
              this.render();
        }, (err) => {
            console.error(err);
        });
    }
  }
  render(){
    if(this.props.result == ""){
      return <p></p>;
    }
    const {items,is_loaded} = this.state;
    let word = this.props.is_rhythm?`Words that rhyme with ${this.props.result}`:`Words with a meaning similar to ${this.props.result}`;
    let lists = []
    if(!is_loaded){
      return <div>Loading...</div>
    }else{
      if(this.props.is_rhythm){
        if(items.length==0){
          return(
            <div>
            <p>{word}</p>
            <p>(None)</p>
          </div>
          )
        }
        const result = groupBy(items,({numSyllables})=>numSyllables)
        Object.keys(result).map((keys)=>{
          result[keys].map((num)=>{
            lists.push(<SaveButton clickHandler={(words)=>this.clickHandler(words)} word={num.word}/>);
          })
        })
        return(
          <div>
            <p>{word}</p>
            <ul>
              {lists.map((nums,idx)=>{return(<li key={nums}>{nums}</li>)})}
            </ul>
          </div>
        )
      }else{
        if(items.length==0){
          return(
            <div>
            <p>{word}</p>
            <p>(None)</p>
          </div>
          )
        }
        Object.keys(items).map((keys)=>{
          lists.push(<SaveButton  key={this.props.word} clickHandler={(words)=>this.clickHandler(words)} word ={items[keys].word}/>);
        })
        return(
          <div>
            <p>{word}</p>
            <ul>
              {lists.map((nums,idx)=>{return(<li key={idx}>{nums}</li>)})}
            </ul>
          </div>
        )
      }
    }
    
  }
  
}
class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {save:[], 
                  value:"",
                  result:"",
                  is_rhythm:true}
    this.onChange = this.onChange.bind(this);
    this.handleWords = this.handleWords.bind(this);
    this.handleSynonyms = this.handleSynonyms.bind(this);
  }
  onChange(event){
    this.setState({value:event.target.value});
  }
  onSave(word){
    this.setState({save:[...this.state.save,word]});
  }
  handleWords(event){
    this.setState({is_rhythm:true,result:this.state.value});
    this.setState({value:""});

    event.preventDefault();
  }
  componentDidUpdate(){
    document.addEventListener('keydown',this.onkeydown)
  }
  onkeydown = (e)=>{
    if(e.keyCode == 13){
      this.handleWords(e)
    }
  }
  handleSynonyms(event){
    this.setState({is_rhythm:false,result:this.state.value});
    this.setState({value:""});
    event.preventDefault();
  }
  render(){
    let value = this.state.value;
    return(
      <div>
        <Save save={this.state.save}></Save>
        <input type="text" value = {value} onChange={this.onChange} placeholder="Enter a word" />
        <button type = "button" onClick={this.handleWords}>Show rhyming words</button>
        <button type = "button" onClick={this.handleSynonyms}>Show synonyms</button>
        <Result onSave={(word)=>this.onSave(word)} result={this.state.result} is_rhythm={this.state.is_rhythm}></Result>
      </div>
    )
  }
}
function App() {
  return (
    <div className="App">
      <header>
        <h1>Rhyme Finder(SI 579 Problem Set 6)</h1>
      </header>
      <a href="https://github.com/annaleee/Rhyme-Finder" >Link of my repo</a>
      <Panel className="panel"></Panel>
    </div>
  );
}

export default App;
