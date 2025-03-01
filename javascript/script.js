let app = new Vue({
    el: '#app',
    data: {
        sitename: 'EHelp',
        cart: [],
        lessons: [ // lessons data
            { id: 1, subject: 'English', location: 'room G04', price: 10, spaces: 5, image: '../images/english.svg' },
            { id: 2, subject: 'Math', location: 'room G05', price: 10, spaces: 5, image: '../images/maths.svg' },
            { id: 3, subject: 'Science', location: 'room G09', price: 15, spaces: 3, image: '../images/science.svg' },
            { id: 4, subject: 'IT', location: 'room G08', price: 20, spaces: 8, image: '../images/it.svg' },
            { id: 5, subject: 'History', location: 'room G10', price: 15, spaces: 8, image: '../images/history.svg' },
            { id: 6, subject: 'Geography', location: 'room G11', price: 12, spaces: 6, image: '../images/geography.svg' },
            { id: 7, subject: 'Art', location: 'room G12', price: 18, spaces: 4, image: '../images/art.svg' },
            { id: 8, subject: 'Chinese', location: 'room G13', price: 10, spaces: 10, image: '../images/chinese.svg' },
            { id: 9, subject: 'Music', location: 'room G14', price: 20, spaces: 5, image: '../images/music.svg' },
            { id: 10, subject: 'Law', location: 'room G15', price: 15, spaces: 7, image: '../images/law.svg' }
        ],
        displayedLessons: [], // lessons to display after search and sort
        searchQuery: '', // search query
        sortBy: 'subject', // sort by subject by default
        sortOrder: 'asc', // sort in ascending order by default
        name: '', // name and phone (below)  input for cart submission
        phone: '', 
        orderSubmitted: false, // order is not submitted by default 
        nameError: '',
        phoneError: '',
        isCartPopupVisible: false // cart popup is not visible by default
    },
    methods: {
        addToCart: function (lesson) { // add lesson to cart
            if (lesson.spaces > 0) {
                let cartItem = this.cart.find(item => item.id === lesson.id);
                if (cartItem) {
                    cartItem.quantity++; // increase quantity
                } else {
                    this.cart.push({ ...lesson, quantity: 1 });
                }
                lesson.spaces--; // decrease spaces available
            }
        },
        removeProduct: function (index) { // remove lesson from cart
            let product = this.cart[index];
            let lesson = this.lessons.find(lesson => lesson.id === product.id); 
            lesson.spaces += product.quantity; 
            this.cart.splice(index, 1); // remove lesson from cart
        },
        increaseQuantity: function (index) { // increase quantity of lesson in cart
            let product = this.cart[index];
            let lesson = this.lessons.find(lesson => lesson.id === product.id); 
            if (lesson.spaces > 0) { // check if spaces are available
                product.quantity++;
                lesson.spaces--;
            }
        },
        decreaseQuantity: function (index) { // decrease quantity of lesson in cart
            let product = this.cart[index];
            let lesson = this.lessons.find(lesson => lesson.id === product.id);
            if (product.quantity > 1) { // check if quantity is greater than 1
                product.quantity--;
                lesson.spaces++;
            } else {
                this.removeProduct(index);
            }
        },
        performSearch: function () { // search lessons by subject, location, price, spaces
            let query = this.searchQuery.toLowerCase();
            this.displayedLessons = this.lessons.filter(lesson => {
                return lesson.subject.toLowerCase().includes(query) ||
                    lesson.location.toLowerCase().includes(query) ||
                    lesson.price.toString().includes(query) ||
                    lesson.spaces.toString().includes(query);
            });
        },
        sortLessons: function () { // sort lessons by subject, location, price, spaces
            this.displayedLessons.sort((a, b) => {
                let modifier = this.sortOrder === 'asc' ? 1 : -1;
                if (a[this.sortBy] < b[this.sortBy]) return -1 * modifier;
                if (a[this.sortBy] > b[this.sortBy]) return 1 * modifier;
                return 0;
            });
        },
        toggleCartPopup: function () { // toggle cart popup
            this.isCartPopupVisible = !this.isCartPopupVisible;
        },
        checkout: function () { // checkout function
            if (this.validateForm()) {
                // set order submitted to true
                this.orderSubmitted = true;
                
                // keep popup open for 2 seconds to show the success message
                setTimeout(() => {
                    // Reset everything
                    this.cart = [];
                    this.name = '';
                    this.phone = '';
                    this.isCartPopupVisible = false;
                    
                    // reset orderSubmitted after popup closes
                    setTimeout(() => {
                        this.orderSubmitted = false;
                    }, 500);
                }, 2000);
            }
        },

        validateForm: function () { // verif check for correct phone and name
            this.nameError = '';
            this.phoneError = '';
            let valid = true;
            
            // check for empty name input first
            if (!this.name.trim()) {
                this.nameError = 'Name is required'; // check if empty
                valid = false;
            } else if (!/^[a-zA-Z\s]+$/.test(this.name)) {
                this.nameError = 'Name must contain letters only'; // allow spaces
                valid = false;
            }
            
            // check for empty phone input first
            if (!this.phone.trim()) {
                this.phoneError = 'Phone number is required'; // check if empty
                valid = false;
            } else if (!/^\d+$/.test(this.phone)) {
                this.phoneError = 'Phone must contain numbers only';
                valid = false;
            }
            
            return valid; // status check for form validation
        },

        closePopupOnOutsideClick: function(event) { // close basket if clicekd outside
            if (event.target.classList.contains('popup')) {
                this.isCartPopupVisible = false;
            }
        },
    },
    computed: { // dependent properties
        totalCartItems: function () {
            return this.cart.reduce((total, product) => total + product.quantity, 0);
        },
        totalPrice: function () {
            return this.cart.reduce((total, product) => total + product.price * product.quantity, 0);
        },
        isCheckoutValid: function () {
            return this.name && this.phone && !this.nameError && !this.phoneError;
        }
    },
    mounted() { // vuejs app loader
        this.displayedLessons = this.lessons;
    }
});