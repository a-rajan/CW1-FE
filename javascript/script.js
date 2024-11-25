let app = new Vue({
    el: '#app', // LESSON DATA FOR APP STRUCTURE
    data: {
        sitename: 'EHelp', // WEBAPP NAME
        newProduct: '', // CODE FOR ADDING A NEW PRODUCT/SEARCH
        cart: [], // SHOPPING CART ARRAY
        lessons: [ // AVAILABLE LESSONS
            { id: 1, subject: 'English', location: 'room G04', price: 10, spaces: 5, image: '../images/english.svg' }, // lessons + room + price + spaces + image
            { id: 2, subject: 'Math', location: 'room G05', price: 10, spaces: 5, image: '../images/maths.svg' }, // resize images to 100x100px
            { id: 3, subject: 'Science', location: 'room G09', price: 15, spaces: 3, image: '../images/science.svg' }, // image added
            { id: 4, subject: 'IT', location: 'room G08', price: 20, spaces: 8, image: '../images/it.svg' }, // image added 
            { id: 5, subject: 'History', location: 'room G10', price: 15, spaces: 8, image: '../images/history.svg' }, // image added
            { id: 6, subject: 'Geography', location: 'room G11', price: 12, spaces: 6, image: '../images/geography.svg' }, // add image for geography-french 
            { id: 7, subject: 'Art', location: 'room G12', price: 18, spaces: 4, image: '../images/art.svg' },
            { id: 8, subject: 'Chinese', location: 'room G13', price: 10, spaces: 10, image: '../images/Chinese.svg' },
            { id: 9, subject: 'Music', location: 'room G14', price: 20, spaces: 5, image: '../images/music.svg' },
            { id: 10, subject: 'Law', location: 'room G15', price: 15, spaces: 7, image: '../images/Law.svg' }
        ], // add more lessons as needed
        searchQuery: '', // SEARCH QUERY INPUT
        displayedLessons: [], // LESSONS TO DISPLAY BASED ON SEARCH
        searchTimeout: null // Timeout reference for debounce
    }, //1-10 lessons added. images to be added further down
    methods: { // 
        addToCart: function (lesson) {
            let cartItem = this.cart.find(item => item.id === lesson.id);
            if (lesson.spaces > 0) { // check if lesson has available spaces
                if (cartItem) {
                    cartItem.quantity++;  // increase quantity of the lessons in the cart
                    lesson.spaces--; // lower amount of wanted lessons
                } else {
                    this.cart.push({ // supporting metadata for cart
                        id: lesson.id,
                        subject: lesson.subject,
                        image: lesson.image,
                        price: lesson.price,
                        quantity: 1
                    }); // made changes to stack multiple quantities of an item instead of making cart length longer.
                    lesson.spaces--; // delete available spaces
                } // add lesson to cart
            } else {
                alert("no more spaces available"); // alert if no more spaces available
            } // quantity management
        },

        removeProduct: function (index) { // remove product from cart
            let cartItem = this.cart[index];
            let lesson = this.lessons.find(item => item.id === cartItem.id);
            lesson.spaces += cartItem.quantity;
            this.cart.splice(index, 1); // PLEASE MAKE SURE THIS IS STILL WITHIN METHODS/
            // remove product from cart by index - also removes quantity
            // !IMPORTANT! do not get "SPLICE" and "SLICE" mixed up. "SPLICE" is for adding/removing array items (adding lessons etc.), "SLICE" is for copying array items (displaying lessons etc.)
        },

        increaseQuantity: function (index) { // increase quantity of a product in the cart
            let cartItem = this.cart[index];
            let lesson = this.lessons.find(item => item.id === cartItem.id); // find lesson by ID
            if (lesson.spaces > 0) { // check if lesson has available spaces
                cartItem.quantity++; // increase quantity of the lessons in the cart
                lesson.spaces--;  // lower amount of wanted lessons
            } else {
                alert("no more spaces available for this lesson."); // ran out of stock
            }
        },

        decreaseQuantity: function (index) { // decrease quantity of a product in the cart
            let cartItem = this.cart[index];
            let lesson = this.lessons.find(item => item.id === cartItem.id); // find lesson by ID
            cartItem.quantity--;
            lesson.spaces++;
            if (cartItem.quantity === 0) {
                this.cart.splice(index, 1); // remove product from cart if quantity is 0
            }
        },

        performSearch: function () { // search function
            clearTimeout(this.searchTimeout); // remove previous timeout occurences if necssary

            const vm = this;// memorize the current context
            this.searchTimeout = setTimeout(function () {
                const query = vm.searchQuery.trim().toLowerCase();

                if (query !== '') { // If search input is not empty
                    vm.displayedLessons = vm.lessons.filter(lesson => {
                        return (
                            lesson.subject.toLowerCase().includes(query) || // Search in subject
                            lesson.location.toLowerCase().includes(query) || // Search in location
                            lesson.price.toString().includes(query) ||      // Search in price
                            lesson.spaces.toString().includes(query)        // Search in spaces
                        );
                    }); // search will be based on already stocked subject, location, price, and spaces
                } else {
                    vm.displayedLessons = vm.lessons; // If search input is empty, display all lessons
                }
            }, 300); // 300ms wait time before searching
        },
                // method to sort by price
                sortPrice: function () {
                    this.sortLessons('price');
                },
        
                // method to sort by spaces
                sortSpaces: function () {
                    this.sortLessons('spaces');
                },
        
                // method to sort alphabetically by subject
                sortAlphabetical: function () {
                    this.sortLessons('subject');
                },
        
    },
    computed: { //post-production/finalised(?) cart data.
        totalCartItems: function () { // total number of items in the cart
            return this.cart.reduce((total, item) => total + item.quantity, 0);
        },
        totalPrice: function () { // total price of items in the cart
            return this.cart.reduce((total, item) => total + item.price * item.quantity, 0);
        }
    },
    mounted() {
        this.displayedLessons = this.lessons;
    },
    beforeDestroy() {
        clearTimeout(this.searchTimeout); // clear timeout before deleting the component to improve memory performance(?) 
    }
});