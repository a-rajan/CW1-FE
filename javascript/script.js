let app = new Vue({ // vuejs app
    el: '#app',
    data: {
        sitename: 'EHelp',
        cart: [],
        lessons: [], // empty array to be filled from api
        displayedLessons: [], // lessons to display after search and sort
        searchQuery: '', // search query
        sortBy: 'subject', // sort by subject by default
        sortOrder: 'asc', // sort in ascending order by default
        name: '', // name and phone (below) input for cart submission
        phone: '',
        orderSubmitted: false, // order is not submitted by default 
        nameError: '',
        phoneError: '',
        isCartPopupVisible: false, // cart popup is not visible by default
        apiUrl: 'https://cw1-be.onrender.com' // post-render url change
    },
    methods: {
        // fetch lessons from backend api
        fetchLessons: function () {
            fetch(`${this.apiUrl}/lessons`) // api call
                .then(response => response.json())
                .then(data => { // data from api
                    // map backend data to match frontend structure
                    this.lessons = data.map(lesson => ({
                        ...lesson,
                        id: lesson._id // keep id property for compatibility
                    }));
                    this.displayedLessons = [...this.lessons];
                })
                .catch(error => {
                    console.error('error loading lessons:', error);
                });
        },

        addToCart: function (lesson) { // add lesson to cart
            if (lesson.spaces > 0) {
                let cartItem = this.cart.find(item => item.id === lesson.id);
                if (cartItem) {
                    cartItem.quantity++; // increase quantity
                } else {
                    this.cart.push({ ...lesson, quantity: 1 });
                }
                lesson.spaces--; // decrease spaces available

                // update spaces in db
                this.updateLessonSpaces(lesson.id, lesson.spaces);
            }
        },

        // update lesson spaces in db
        updateLessonSpaces: function (lessonId, spaces) {
            fetch(`${this.apiUrl}/lessons/${lessonId}`, { // api call
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ spaces: spaces }) // send spaces value
            }).catch(error => {
                console.error('error updating lesson spaces:', error);
            });
        },

        removeProduct: function (index) { // remove lesson from cart
            let product = this.cart[index];
            let lesson = this.lessons.find(lesson => lesson.id === product.id);
            lesson.spaces += product.quantity;
            this.cart.splice(index, 1); // remove lesson from cart

            // update spaces in db
            this.updateLessonSpaces(lesson.id, lesson.spaces);
        },

        increaseQuantity: function (index) { // increase quantity of lesson in cart
            let product = this.cart[index];
            let lesson = this.lessons.find(lesson => lesson.id === product.id); //
            if (lesson.spaces > 0) { // check if spaces are available
                product.quantity++;
                lesson.spaces--;
                this.updateLessonSpaces(lesson.id, lesson.spaces); // decrease amount of available after increasing quantity
            }
        },

        decreaseQuantity: function (index) { // decrease quantity of lesson in cart
            let product = this.cart[index];
            let lesson = this.lessons.find(lesson => lesson.id === product.id);
            if (product.quantity > 1) { // check if quantity is greater than 1
                product.quantity--;
                lesson.spaces++;

                // update spaces in db
                this.updateLessonSpaces(lesson.id, lesson.spaces);
            } else {  // remove lesson if quantity is already 1
                this.removeProduct(index);
            }
        },

        performSearch: function () { // search lessons
            if (this.searchQuery.trim() === '') { // empty search
                this.displayedLessons = [...this.lessons]; // show all lessons
                return;
            }

            // use backend search api
            fetch(`${this.apiUrl}/search?q=${encodeURIComponent(this.searchQuery)}`) // api call
                .then(response => response.json())
                .then(data => {
                    // map backend data to match frontend structure
                    this.displayedLessons = data.map(lesson => ({
                        ...lesson,
                        id: lesson._id // keep id property for compatibility
                    }));
                })
                .catch(error => { // error handling
                    console.error('search error:', error);
                    // fallback to client-side search if api fails
                    let query = this.searchQuery.toLowerCase();
                    this.displayedLessons = this.lessons.filter(lesson => {
                        return lesson.subject.toLowerCase().includes(query) ||
                            lesson.location.toLowerCase().includes(query) ||
                            lesson.price.toString().includes(query) ||
                            lesson.spaces.toString().includes(query);
                    });
                });
        },

        // other methods remain the same
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
        closePopupOnOutsideClick: function (event) { // close basket if clicekd outside
            if (event.target.classList.contains('popup')) {
                this.isCartPopupVisible = false;
            }
        },

        checkout: function () { // checkout function with api call
            if (this.validateForm()) {
                // send order to backend api
                fetch(`${this.apiUrl}/orders`, { // api call
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: this.name,
                        phone: this.phone,
                        cart: this.cart
                    })
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('order submission failed');
                        }
                        return response.json();
                    })
                    .then(data => {
                        // set order submitted to true
                        this.orderSubmitted = true;

                        // keep popup open for 2 seconds to show the success message
                        setTimeout(() => {
                            // reset everything
                            this.cart = [];
                            this.name = '';
                            this.phone = '';
                            this.isCartPopupVisible = false;

                            // refresh lessons from server to get latest spaces
                            this.fetchLessons();

                            // reset orderSubmitted after popup closes
                            setTimeout(() => {
                                this.orderSubmitted = false;
                            }, 500);
                        }, 2000);
                    })
                    .catch(error => {
                        console.error('checkout error:', error);
                        alert('failed to submit order. please try again.');
                    });
            }
        }
    },
    computed: { // dependent properties remain the same
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
    mounted() { // fetch lessons when vue app loads
        this.fetchLessons(); // load lessons from api instead of hardcoded data
    }
});