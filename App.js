import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, BackHandler, Image, ImageBackground, ScrollView, StatusBar,
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const STORAGE_KEY = "foodie_app_recipes_v1";

const CATEGORIES = [
  "All", "Breakfast", "Lunch", "Dinner", "Desserts", "Snacks",
  "Beverages", "Salads", "Vegetarian", "Non-Vegetarian", "My Food"
];

const SEED_RECIPES = [
  { id:"r1", name:"Fluffy Pancakes", category:"Breakfast", image:"https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=900", ingredients:["1 cup all-purpose flour","1 tbsp sugar","1 tsp baking powder","1 egg","¾ cup milk","2 tbsp melted butter"], instructions:["Mix flour, sugar and baking powder in a bowl.","Whisk egg, milk and melted butter separately.","Combine wet and dry ingredients until just mixed.","Pour batter onto a warm pan and cook until bubbles form.","Flip and cook until golden. Serve warm."], prepTime:"20 min", servings:"2", calories:"280", difficulty:"Easy", favorite:false, mine:false },
  { id:"r2", name:"Avocado Toast", category:"Breakfast", image:"https://images.unsplash.com/photo-1525351484163-7529414344d8?w=900", ingredients:["2 slices bread","1 ripe avocado","½ lemon","Salt and pepper","Chilli flakes"], instructions:["Toast the bread until crisp.","Mash avocado with lemon juice, salt and pepper.","Spread over toast and sprinkle chilli flakes.","Serve immediately."], prepTime:"10 min", servings:"1", calories:"230", difficulty:"Easy", favorite:false, mine:false },
  { id:"r3", name:"Creamy Tomato Pasta", category:"Lunch", image:"https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900", ingredients:["200 g pasta","2 tomatoes","2 tbsp cream","2 garlic cloves","1 tbsp olive oil","Salt and herbs"], instructions:["Boil pasta until al dente and reserve some pasta water.","Sauté garlic in olive oil.","Add chopped tomatoes and cook until soft.","Stir in cream, herbs and a splash of pasta water.","Toss with pasta and serve."], prepTime:"25 min", servings:"2", calories:"420", difficulty:"Medium", favorite:false, mine:false },
  { id:"r4", name:"Rainbow Buddha Bowl", category:"Salads", image:"https://images.unsplash.com/photo-1512621776951-a57141f2e3d?w=900", ingredients:["1 cup cooked quinoa","½ cucumber","1 carrot","½ avocado","½ cup chickpeas","Lemon dressing"], instructions:["Prepare quinoa and let it cool slightly.","Slice the vegetables and avocado.","Arrange quinoa, vegetables and chickpeas in a bowl.","Drizzle with lemon dressing and serve."], prepTime:"20 min", servings:"1", calories:"360", difficulty:"Easy", favorite:false, mine:false },
  { id:"r5", name:"Mango Smoothie", category:"Beverages", image:"https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=900", ingredients:["1 ripe mango","½ cup yoghurt","½ cup milk","1 tsp honey","Ice cubes"], instructions:["Peel and dice the mango.","Add all ingredients to a blender.","Blend until smooth and creamy.","Pour into a glass and serve chilled."], prepTime:"5 min", servings:"2", calories:"190", difficulty:"Easy", favorite:false, mine:false },
  { id:"r6", name:"Chocolate Brownies", category:"Desserts", image:"https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900", ingredients:["½ cup butter","1 cup sugar","2 eggs","⅓ cup cocoa powder","½ cup flour","1 tsp vanilla"], instructions:["Preheat oven to 175°C.","Melt butter and mix with sugar.","Beat in eggs and vanilla.","Fold in cocoa and flour.","Bake in a lined tin for 20–25 minutes and cool before slicing."], prepTime:"40 min", servings:"8", calories:"310", difficulty:"Medium", favorite:false, mine:false },
  { id:"r7", name:"Paneer Tikka", category:"Vegetarian", image:"https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=900", ingredients:["200 g paneer","½ cup yoghurt","1 tsp tikka masala","1 capsicum","1 onion","1 tbsp oil"], instructions:["Cut paneer and vegetables into cubes.","Mix yoghurt, spice mix and oil.","Coat paneer and vegetables in the marinade.","Thread onto skewers and grill or pan-cook until lightly charred."], prepTime:"30 min", servings:"2", calories:"340", difficulty:"Medium", favorite:false, mine:false },
  { id:"r8", name:"Vegetable Fried Rice", category:"Dinner", image:"https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900", ingredients:["2 cups cooked rice","½ cup mixed vegetables","2 garlic cloves","1 tbsp soy sauce","1 tbsp oil","Spring onions"], instructions:["Heat oil in a wok and sauté garlic.","Add vegetables and stir-fry until tender-crisp.","Add cooked rice and soy sauce.","Toss on high heat and garnish with spring onions."], prepTime:"20 min", servings:"2", calories:"390", difficulty:"Easy", favorite:false, mine:false },
  { id:"r9", name:"Grilled Chicken", category:"Non-Vegetarian", image:"https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=900", ingredients:["2 chicken breasts","1 tbsp olive oil","1 tsp paprika","1 tsp garlic powder","Salt and pepper"], instructions:["Pat chicken dry.","Mix oil and seasonings and coat the chicken.","Heat a grill pan over medium heat.","Cook until browned and the centre reaches a safe temperature.","Rest briefly before serving."], prepTime:"30 min", servings:"2", calories:"320", difficulty:"Medium", favorite:false, mine:false },
  { id:"r10", name:"Crispy Potato Wedges", category:"Snacks", image:"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=900", ingredients:["3 potatoes","1 tbsp olive oil","½ tsp paprika","½ tsp garlic powder","Salt"], instructions:["Preheat oven to 220°C.","Cut potatoes into wedges and pat dry.","Toss with oil and seasonings.","Bake for 25–30 minutes, turning halfway, until crisp."], prepTime:"35 min", servings:"3", calories:"250", difficulty:"Easy", favorite:false, mine:false }
];

const COLORS = { ink:"#20243A", muted:"#85899B", purple:"#7657E8", pale:"#F4F1FF", bg:"#F8F8FC", white:"#FFFFFF", line:"#ECECF2", orange:"#FFB45B" };

export default function App() {
  const [recipes, setRecipes] = useState(SEED_RECIPES);
  const [loaded, setLoaded] = useState(false);
  const [category, setCategory] = useState("All");
  const [screen, setScreen] = useState("home");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm());

  function emptyForm() {
    return { name:"", category:"Breakfast", image:"", ingredients:"", instructions:"", prepTime:"20 min", servings:"2", calories:"", difficulty:"Easy" };
  }

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setRecipes(JSON.parse(saved));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes)).catch(() => {});
  }, [recipes, loaded]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen === "detail") { setScreen(selected && selected.mine ? "myRecipes" : "home"); return true; }
      if (screen === "form") { setScreen(editing ? "detail" : "home"); return true; }
      if (screen !== "home") { setScreen("home"); return true; }
      return false;
    });
    return () => sub.remove();
  }, [screen, selected, editing]);

  const visibleRecipes = useMemo(() => {
    let list = recipes;
    if (category === "My Food") list = list.filter(r => r.mine);
    else if (category === "Favorites") list = list.filter(r => r.favorite);
    else if (category !== "All") list = list.filter(r => r.category === category && !r.mine);
    else list = list.filter(r => !r.mine);
    if (search.trim()) list = list.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [recipes, category, search]);

  const goBack = () => {
    if (screen === "detail") setScreen(selected && selected.mine ? "myRecipes" : "home");
    else if (screen === "form") setScreen(editing ? "detail" : "home");
    else setScreen("home");
  };

  const openRecipe = (recipe) => { setSelected(recipe); setScreen("detail"); };
  const toggleFavorite = (id) => setRecipes(old => old.map(r => r.id === id ? {...r, favorite:!r.favorite} : r));
  const startAdd = () => { setEditing(null); setForm(emptyForm()); setScreen("form"); };
  const startEdit = (recipe) => {
    setEditing(recipe.id);
    setForm({...recipe, ingredients:recipe.ingredients.join("\n"), instructions:recipe.instructions.join("\n")});
    setScreen("form");
  };
  const saveRecipe = () => {
    if (!form.name.trim() || !form.ingredients.trim() || !form.instructions.trim()) {
      Alert.alert("Missing details", "Please enter the recipe name, ingredients and instructions."); return;
    }
    const data = {
      ...form, id: editing || "mine_" + Date.now(), name:form.name.trim(),
      ingredients:form.ingredients.split("\n").map(x=>x.trim()).filter(Boolean),
      instructions:form.instructions.split("\n").map(x=>x.trim()).filter(Boolean),
      favorite: editing ? (recipes.find(r=>r.id===editing)?.favorite || false) : false,
      mine:true
    };
    if (editing) {
      setRecipes(old=>old.map(r=>r.id===editing?data:r));
      setSelected(data); setScreen("detail");
    } else {
      setRecipes(old=>[data,...old]); setSelected(data); setCategory("My Food"); setScreen("detail");
    }
  };
  const deleteRecipe = (recipe) => Alert.alert("Delete recipe?", `Remove "${recipe.name}" from My Recipes?`, [
    {text:"Cancel", style:"cancel"},
    {text:"Delete", style:"destructive", onPress:()=>{setRecipes(old=>old.filter(r=>r.id!==recipe.id));setSelected(null);setScreen("myRecipes");}}
  ]);
  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert("Permission needed", "Allow photo library access to choose a recipe image."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({mediaTypes:["images"], allowsEditing:true, aspect:[4,3], quality:0.8});
    if (!result.canceled) setForm(old=>({...old,image:result.assets[0].uri}));
  };

  const Header = ({title, back=true, right=null}) => (
    <View style={styles.header}>
      {back ? <TouchableOpacity onPress={goBack} style={styles.backBtn}><Text style={styles.backText}>‹</Text></TouchableOpacity> : <View style={{width:42}}/>}
      <Text style={styles.headerTitle}>{title}</Text>
      {right || <View style={{width:42}}/>}
    </View>
  );

  const RecipeCard = ({item}) => (
    <TouchableOpacity style={styles.recipeCard} onPress={()=>openRecipe(item)} activeOpacity={0.88}>
      <Image source={{uri:item.image || "https://images.unsplash.com/photo-1547592180-85f173990554?w=800"}} style={styles.cardImage}/>
      <TouchableOpacity style={styles.heart} onPress={()=>toggleFavorite(item.id)}>
        <Text style={{fontSize:19,color:item.favorite?"#F05B75":"#34364A"}}>{item.favorite?"♥":"♡"}</Text>
      </TouchableOpacity>
      <View style={styles.cardBody}>
        <Text style={styles.recipeName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.recipeMeta}>{item.prepTime || "20 min"}  ·  {item.difficulty || "Easy"}</Text>
      </View>
    </TouchableOpacity>
  );

  if (screen === "detail" && selected) {
    const current = recipes.find(r=>r.id===selected.id) || selected;
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content"/>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.detailHero}>
            <Image source={{uri:current.image || "https://images.unsplash.com/photo-1547592180-85f173990554?w=900"}} style={styles.detailImage}/>
            <TouchableOpacity style={styles.floatingBack} onPress={goBack}><Text style={styles.backText}>‹</Text></TouchableOpacity>
            <TouchableOpacity style={styles.floatingHeart} onPress={()=>toggleFavorite(current.id)}><Text style={{fontSize:23,color:current.favorite?"#F05B75":"#34364A"}}>{current.favorite?"♥":"♡"}</Text></TouchableOpacity>
          </View>
          <View style={styles.detailContent}>
            <Text style={styles.categoryLabel}>{current.category.toUpperCase()}</Text>
            <Text style={styles.detailTitle}>{current.name}</Text>
            <View style={styles.statsRow}>
              <Stat label="PREP TIME" value={current.prepTime || "—"}/>
              <Stat label="SERVINGS" value={current.servings || "—"}/>
              <Stat label="CALORIES" value={current.calories ? `${current.calories} kcal` : "—"}/>
              <Stat label="LEVEL" value={current.difficulty || "Easy"}/>
            </View>
            {current.mine && <View style={styles.actionRow}>
              <TouchableOpacity style={styles.editBtn} onPress={()=>startEdit(current)}><Text style={styles.editText}>✎  Edit</Text></TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={()=>deleteRecipe(current)}><Text style={styles.deleteText}>⌫  Delete</Text></TouchableOpacity>
            </View>}
            <Text style={styles.sectionTitle}>Ingredients <Text style={styles.countText}>({current.ingredients.length})</Text></Text>
            {current.ingredients.map((x,i)=><View style={styles.ingredientRow} key={i}><Text style={styles.bullet}>•</Text><Text style={styles.bodyText}>{x}</Text></View>)}
            <Text style={styles.sectionTitle}>Instructions</Text>
            {current.instructions.map((x,i)=><View style={styles.stepRow} key={i}><View style={styles.stepNumber}><Text style={styles.stepNumberText}>{i+1}</Text></View><Text style={styles.bodyText}>{x}</Text></View>)}
            <View style={{height:35}}/>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (screen === "form") {
    return (
      <View style={styles.container}>
        <Header title={editing?"Edit Recipe":"Add New Recipe"}/>
        <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.fieldLabel}>Recipe name *</Text>
          <TextInput style={styles.input} placeholder="e.g. Homemade Veggie Pizza" value={form.name} onChangeText={v=>setForm(o=>({...o,name:v}))}/>
          <Text style={styles.fieldLabel}>Recipe image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={chooseImage}>
            {form.image ? <Image source={{uri:form.image}} style={styles.previewImage}/> : <><Text style={styles.uploadIcon}>＋</Text><Text style={styles.uploadText}>Choose an image from your device</Text></>}
          </TouchableOpacity>
          <Text style={styles.fieldLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:14}}>
            {CATEGORIES.filter(c=>!["All","My Food"].includes(c)).map(c=><TouchableOpacity key={c} onPress={()=>setForm(o=>({...o,category:c}))} style={[styles.chip,form.category===c&&styles.chipActive]}><Text style={[styles.chipText,form.category===c&&styles.chipTextActive]}>{c}</Text></TouchableOpacity>)}
          </ScrollView>
          <Text style={styles.fieldLabel}>Ingredients list * <Text style={styles.hint}>(one item per line)</Text></Text>
          <TextInput style={[styles.input,styles.multiline]} multiline placeholder={"1 cup flour\n2 eggs\n1 cup milk"} value={form.ingredients} onChangeText={v=>setForm(o=>({...o,ingredients:v}))}/>
          <Text style={styles.fieldLabel}>Step-by-step instructions * <Text style={styles.hint}>(one step per line)</Text></Text>
          <TextInput style={[styles.input,styles.multiline, {minHeight:125}]} multiline placeholder={"Preheat the oven.\nMix all ingredients.\nBake until golden."} value={form.instructions} onChangeText={v=>setForm(o=>({...o,instructions:v}))}/>
          <View style={styles.twoFields}>
            <View style={{flex:1}}><Text style={styles.fieldLabel}>Preparation time</Text><TextInput style={styles.input} value={form.prepTime} onChangeText={v=>setForm(o=>({...o,prepTime:v}))} placeholder="20 min"/></View>
            <View style={{flex:1}}><Text style={styles.fieldLabel}>Servings</Text><TextInput style={styles.input} value={String(form.servings)} onChangeText={v=>setForm(o=>({...o,servings:v}))} placeholder="2"/></View>
          </View>
          <View style={styles.twoFields}>
            <View style={{flex:1}}><Text style={styles.fieldLabel}>Calories</Text><TextInput style={styles.input} value={String(form.calories)} onChangeText={v=>setForm(o=>({...o,calories:v}))} placeholder="300"/></View>
            <View style={{flex:1}}><Text style={styles.fieldLabel}>Difficulty</Text><TextInput style={styles.input} value={form.difficulty} onChangeText={v=>setForm(o=>({...o,difficulty:v}))} placeholder="Easy"/></View>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={saveRecipe}><Text style={styles.primaryBtnText}>Save Recipe</Text></TouchableOpacity>
          <View style={{height:30}}/>
        </ScrollView>
      </View>
    );
  }

  const isMyRecipes = screen === "myRecipes";
  const isFavorites = screen === "favorites";
  const list = isMyRecipes ? recipes.filter(r=>r.mine) : isFavorites ? recipes.filter(r=>r.favorite) : visibleRecipes;
  const pageTitle = isMyRecipes ? "My Recipes" : isFavorites ? "Favorites" : category === "All" ? "Discover recipes" : category;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content"/>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.homeTop}>
          <View style={styles.topLine}>
            <View><Text style={styles.eyebrow}>GOOD FOOD, GOOD MOOD</Text><Text style={styles.greeting}>What would you like{"\n"}to cook today?</Text></View>
            <View style={styles.avatar}><Text style={{fontSize:23}}>👩‍🍳</Text></View>
          </View>
          <View style={styles.searchBox}><Text style={{fontSize:18}}>⌕</Text><TextInput placeholder="Search delicious recipes..." value={search} onChangeText={setSearch} style={styles.searchInput}/></View>
        </View>
        <View style={styles.categorySection}>
          <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Categories</Text><Text style={styles.smallNote}>Explore</Text></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((c,i)=><TouchableOpacity key={c} onPress={()=>{setCategory(c);setScreen(c==="My Food"?"myRecipes":"home");}} style={[styles.categoryChip,category===c&&styles.categoryChipActive]}>
              <Text style={styles.categoryEmoji}>{["🍽️","🍳","🥗","🍲","🍰","🥪","🥤","🥑","🥦","🍗","🧑‍🍳"][i]}</Text><Text style={[styles.categoryText,category===c&&styles.categoryTextActive]}>{c}</Text>
            </TouchableOpacity>)}
          </ScrollView>
        </View>
        <View style={styles.feedSection}>
          <View style={styles.sectionHead}><Text style={styles.sectionTitle}>{pageTitle}</Text><Text style={styles.smallNote}>{list.length} recipes</Text></View>
          {isMyRecipes && <TouchableOpacity style={styles.addCard} onPress={startAdd}><View style={styles.addCircle}><Text style={{fontSize:25,color:COLORS.purple}}>＋</Text></View><View style={{flex:1}}><Text style={styles.addTitle}>Add New Recipe</Text><Text style={styles.addSubtitle}>Save your own special dish</Text></View><Text style={{fontSize:22,color:COLORS.purple}}>›</Text></TouchableOpacity>}
          {list.length===0 ? <View style={styles.emptyState}><Text style={{fontSize:42}}>🍽️</Text><Text style={styles.emptyTitle}>Nothing here yet</Text><Text style={styles.emptyText}>{isFavorites?"Tap the heart on a recipe to save it here.":"Add your first recipe and it will appear here."}</Text>{isMyRecipes&&<TouchableOpacity style={styles.primaryBtn} onPress={startAdd}><Text style={styles.primaryBtnText}>Add New Recipe</Text></TouchableOpacity>}</View> :
            <View style={styles.grid}>{list.map(item=><View key={item.id} style={styles.gridItem}><RecipeCard item={item}/></View>)}</View>}
        </View>
        <View style={{height:30}}/>
      </ScrollView>
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={()=>{setScreen("home");setCategory("All");}}><Text style={styles.navIcon}>⌂</Text><Text style={[styles.navLabel,screen==="home"&&styles.navActive]}>Home</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={()=>setScreen("favorites")}><Text style={styles.navIcon}>♡</Text><Text style={[styles.navLabel,isFavorites&&styles.navActive]}>Favorites</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={()=>setScreen("myRecipes")}><Text style={styles.navIcon}>▤</Text><Text style={[styles.navLabel,isMyRecipes&&styles.navActive]}>My Recipes</Text></TouchableOpacity>
      </View>
    </View>
  );
}

function Stat({label,value}) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:COLORS.bg},
  homeTop:{backgroundColor:COLORS.pale,paddingTop:54,paddingHorizontal:22,paddingBottom:24,borderBottomLeftRadius:28,borderBottomRightRadius:28},
  topLine:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},
  eyebrow:{fontSize:10,fontWeight:"800",letterSpacing:1.5,color:COLORS.purple,marginBottom:8},
  greeting:{fontSize:26,fontWeight:"800",color:COLORS.ink,lineHeight:32},
  avatar:{width:52,height:52,borderRadius:18,backgroundColor:"#FFFFFF",alignItems:"center",justifyContent:"center"},
  searchBox:{marginTop:22,backgroundColor:"#FFFFFF",height:50,borderRadius:15,paddingHorizontal:15,flexDirection:"row",alignItems:"center",gap:10},
  searchInput:{flex:1,fontSize:13,color:COLORS.ink},
  categorySection:{paddingTop:22,paddingLeft:20},
  sectionHead:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingRight:20,marginBottom:13},
  sectionTitle:{fontSize:18,fontWeight:"800",color:COLORS.ink},
  smallNote:{fontSize:11,color:COLORS.muted},
  categoryChip:{width:82,height:83,backgroundColor:"#FFFFFF",borderRadius:16,marginRight:10,alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:COLORS.line},
  categoryChipActive:{backgroundColor:COLORS.purple,borderColor:COLORS.purple},
  categoryEmoji:{fontSize:24,marginBottom:6},
  categoryText:{fontSize:10,fontWeight:"600",color:COLORS.ink},
  categoryTextActive:{color:"#FFFFFF"},
  feedSection:{paddingHorizontal:20,paddingTop:25},
  grid:{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between"},
  gridItem:{width:"48.2%",marginBottom:15},
  recipeCard:{backgroundColor:"#FFFFFF",borderRadius:17,overflow:"hidden",borderWidth:1,borderColor:"#F0F0F4"},
  cardImage:{width:"100%",height:118,backgroundColor:"#EAEAF0"},
  heart:{position:"absolute",top:9,right:9,width:31,height:31,borderRadius:16,backgroundColor:"rgba(255,255,255,0.94)",alignItems:"center",justifyContent:"center"},
  cardBody:{padding:11},
  recipeName:{fontSize:13,fontWeight:"800",color:COLORS.ink},
  recipeMeta:{fontSize:10,color:COLORS.muted,marginTop:5},
  bottomNav:{height:67,backgroundColor:"#FFFFFF",borderTopWidth:1,borderTopColor:COLORS.line,flexDirection:"row",justifyContent:"space-around",alignItems:"center",paddingBottom:5},
  navItem:{alignItems:"center",justifyContent:"center",minWidth:70},
  navIcon:{fontSize:22,color:COLORS.purple},
  navLabel:{fontSize:10,color:COLORS.muted,marginTop:2,fontWeight:"600"},
  navActive:{color:COLORS.purple,fontWeight:"800"},
  header:{height:94,paddingTop:35,paddingHorizontal:17,backgroundColor:"#FFFFFF",flexDirection:"row",alignItems:"center",justifyContent:"space-between",borderBottomWidth:1,borderBottomColor:COLORS.line},
  backBtn:{width:42,height:42,borderRadius:14,backgroundColor:COLORS.pale,alignItems:"center",justifyContent:"center"},
  backText:{fontSize:35,color:COLORS.ink,lineHeight:38,marginTop:-4},
  headerTitle:{fontSize:17,fontWeight:"800",color:COLORS.ink},
  detailHero:{height:285,backgroundColor:"#EDEDF3"},
  detailImage:{width:"100%",height:"100%"},
  floatingBack:{position:"absolute",top:48,left:18,width:42,height:42,borderRadius:14,backgroundColor:"rgba(255,255,255,0.95)",alignItems:"center",justifyContent:"center"},
  floatingHeart:{position:"absolute",top:48,right:18,width:42,height:42,borderRadius:14,backgroundColor:"rgba(255,255,255,0.95)",alignItems:"center",justifyContent:"center"},
  detailContent:{padding:22,backgroundColor:COLORS.bg,borderTopLeftRadius:25,borderTopRightRadius:25,marginTop:-22},
  categoryLabel:{fontSize:10,fontWeight:"800",letterSpacing:1.5,color:COLORS.purple},
  detailTitle:{fontSize:27,fontWeight:"900",color:COLORS.ink,marginTop:6,marginBottom:18},
  statsRow:{flexDirection:"row",justifyContent:"space-between",backgroundColor:"#FFFFFF",borderRadius:16,paddingVertical:14,paddingHorizontal:8,borderWidth:1,borderColor:COLORS.line},
  stat:{alignItems:"center",flex:1},
  statValue:{fontSize:12,fontWeight:"800",color:COLORS.ink},
  statLabel:{fontSize:8,color:COLORS.muted,marginTop:5,fontWeight:"700"},
  sectionTitle:{fontSize:18,fontWeight:"800",color:COLORS.ink,marginTop:24,marginBottom:13},
  countText:{fontSize:12,color:COLORS.muted,fontWeight:"500"},
  ingredientRow:{flexDirection:"row",alignItems:"flex-start",marginBottom:10,paddingLeft:3},
  bullet:{fontSize:19,color:COLORS.purple,marginRight:10,lineHeight:21},
  bodyText:{fontSize:13,color:"#55596D",lineHeight:21,flex:1},
  stepRow:{flexDirection:"row",alignItems:"flex-start",marginBottom:15,gap:11},
  stepNumber:{width:27,height:27,borderRadius:9,backgroundColor:COLORS.pale,alignItems:"center",justifyContent:"center"},
  stepNumberText:{fontSize:12,color:COLORS.purple,fontWeight:"800"},
  actionRow:{flexDirection:"row",gap:10,marginTop:15},
  editBtn:{flex:1,padding:12,borderRadius:12,backgroundColor:COLORS.pale,alignItems:"center"},
  editText:{color:COLORS.purple,fontWeight:"800"},
  deleteBtn:{flex:1,padding:12,borderRadius:12,backgroundColor:"#FFF0F1",alignItems:"center"},
  deleteText:{color:"#D94C61",fontWeight:"800"},
  formContent:{padding:20,paddingBottom:35},
  fieldLabel:{fontSize:12,fontWeight:"800",color:COLORS.ink,marginBottom:8,marginTop:10},
  hint:{fontWeight:"400",color:COLORS.muted},
  input:{backgroundColor:"#FFFFFF",borderWidth:1,borderColor:COLORS.line,borderRadius:12,paddingHorizontal:13,paddingVertical:12,fontSize:13,color:COLORS.ink,minHeight:46},
  multiline:{minHeight:105,textAlignVertical:"top",paddingTop:12},
  imagePicker:{height:135,backgroundColor:"#FFFFFF",borderRadius:14,borderWidth:1,borderColor:"#DCD7F8",borderStyle:"dashed",alignItems:"center",justifyContent:"center",overflow:"hidden"},
  uploadIcon:{fontSize:30,color:COLORS.purple},
  uploadText:{fontSize:11,color:COLORS.muted,marginTop:5},
  previewImage:{width:"100%",height:"100%"},
  chip:{paddingHorizontal:13,paddingVertical:9,borderRadius:18,backgroundColor:"#FFFFFF",borderWidth:1,borderColor:COLORS.line,marginRight:8},
  chipActive:{backgroundColor:COLORS.purple,borderColor:COLORS.purple},
  chipText:{fontSize:11,color:COLORS.ink,fontWeight:"600"},
  chipTextActive:{color:"#FFFFFF"},
  twoFields:{flexDirection:"row",gap:12},
  primaryBtn:{backgroundColor:COLORS.purple,padding:15,borderRadius:13,alignItems:"center",marginTop:22},
  primaryBtnText:{fontSize:14,fontWeight:"800",color:"#FFFFFF"},
  addCard:{backgroundColor:"#FFFFFF",borderRadius:16,padding:14,flexDirection:"row",alignItems:"center",gap:12,borderWidth:1,borderColor:"#E6E0FF",marginBottom:16},
  addCircle:{width:43,height:43,borderRadius:14,backgroundColor:COLORS.pale,alignItems:"center",justifyContent:"center"},
  addTitle:{fontSize:13,fontWeight:"800",color:COLORS.ink},
  addSubtitle:{fontSize:10,color:COLORS.muted,marginTop:4},
  emptyState:{alignItems:"center",padding:28,backgroundColor:"#FFFFFF",borderRadius:18,marginTop:5},
  emptyTitle:{fontSize:16,fontWeight:"800",color:COLORS.ink,marginTop:10},
  emptyText:{fontSize:12,color:COLORS.muted,textAlign:"center",marginTop:6,lineHeight:18}
});
