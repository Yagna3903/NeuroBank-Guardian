from datetime import datetime

MOCK_USERS = [
    {
        "user_id": "user_001",
        "name": "Om Solanki",
        "email": "emailtosolankiom@gmail.com",
        "phone": "+1-416-555-0101",
        "risk_score": 95,
        "credit_score": 780,
        "accounts": [
            {
                "account_id": "acc_001_chq",
                "type": "Chequing",
                "balance": 2453.82,
                "currency": "CAD"
            },
            {
                "account_id": "acc_001_sav",
                "type": "Savings",
                "balance": 15234.19,
                "currency": "CAD"
            }
        ],
        "loans": [
            {
                "loan_id": "loan_001_mtg",
                "type": "Mortgage",
                "original_amount": 350000.00,
                "remaining_balance": 124892.45,
                "interest_rate": 3.45,
                "next_payment_date": datetime(2025, 11, 1)
            }
        ],
        "credit_cards": [
            {
                "card_id": "cc_4512_3849",
                "name": "Infinite Visa",
                "limit": 5000.00,
                "current_balance": 1173.54,
                "due_date": datetime(2025, 10, 25)
            }
        ],
        "bills": [
            {
                 "bill_id": "bill_hydro_oct",
                 "merchant": "Hydro One",
                 "amount": 145.20,
                 "due_date": datetime(2025, 10, 30),
                 "status": "Unpaid",
                 "category": "Utilities"
            },
            {
                 "bill_id": "bill_rent_nov",
                 "merchant": "Landlord Corp",
                 "amount": 1200.00,
                 "due_date": datetime(2025, 11, 1),
                 "status": "Unpaid",
                 "category": "Rent"
            }
        ]
    },
    {
        "user_id": "user_002",
        "name": "Yagna Patel",
        "email": "yagna3903@gmail.com",
        "phone": "+1-647-555-0199",
        "risk_score": 88,
        "credit_score": 720,
        "accounts": [
            {
                "account_id": "acc_002_chq",
                "type": "Chequing",
                "balance": 5842.21,
                "currency": "CAD"
            },
            {
                "account_id": "acc_002_sav",
                "type": "Savings",
                "balance": 25193.45,
                "currency": "CAD",
                "interest_rate": 4.5
            },
            {
                "account_id": "acc_002_inv",
                "type": "Investment",
                "balance": 10567.89,
                "currency": "CAD",
                "holdings": "S&P 500 ETF, NASDAQ ETF"
            }
        ],
        "loans": [],
        "credit_cards": [
             {
                "card_id": "cc_5423_9012",
                "name": "World Elite Mastercard",
                "limit": 8500.00,
                "current_balance": 2341.67,
                "due_date": datetime(2025, 10, 20)
            }
        ]
    },
    {
        "user_id": "user_003",
        "name": "Sarisha",
        "email": "tn24vy@brocku.ca",
        "phone": "+1-647-555-0200",
        "risk_score": 92,
        "credit_score": 810,
        "accounts": [
            {
                "account_id": "acc_003_chq",
                "type": "Chequing",
                "balance": 3215.11,
                "currency": "CAD"
            }
        ],
        "loans": [],
        "credit_cards": []
    }
]

MOCK_TRANSACTIONS = [
    {
        "user_id": "user_001",
        "amount": 150.00,
        "merchant": "Hydro One",
        "date": datetime(2025, 10, 1),
        "category": "Utilities",
        "description": "Monthly electricity bill payment for October."
    },
    {
        "user_id": "user_001",
        "amount": 45.50,
        "merchant": "Metro",
        "date": datetime(2025, 10, 3),
        "category": "Groceries",
        "description": "Weekly grocery shopping, fresh produce and milk."
    },
    {
        "user_id": "user_001",
        "amount": 12.50,
        "merchant": "Starbucks",
        "date": datetime(2025, 10, 4),
        "category": "Dining",
        "description": "Coffee run."
    },
    {
        "user_id": "user_001",
        "amount": 140.23,
        "merchant": "Walmart",
        "date": datetime(2025, 10, 6),
        "category": "Groceries",
        "description": "Household supplies and groceries."
    },
    {
        "user_id": "user_001",
        "amount": 24.00,
        "merchant": "Uber",
        "date": datetime(2025, 10, 7),
        "category": "Transport",
        "description": "Ride to downtown."
    },
    {
        "user_id": "user_001",
        "amount": 15.99,
        "merchant": "Netflix",
        "date": datetime(2025, 10, 15),
        "category": "Subscription",
        "description": "Monthly subscription."
    },
    {
        "user_id": "user_001",
        "amount": 3200.00,
        "merchant": "Tech Solutions Payroll",
        "date": datetime(2025, 10, 15),
        "category": "Income",
        "description": "Salary Deposit"
    },
    {
        "user_id": "user_001",
        "amount": 50.00,
        "merchant": "GoodLife Fitness",
        "date": datetime(2025, 10, 16),
        "category": "Health",
        "description": "Monthly gym membership."
    },
    {
        "user_id": "user_001",
        "amount": 89.50,
        "merchant": "Amazon",
        "date": datetime(2025, 10, 18),
        "category": "Shopping",
        "description": "Electronics adapter."
    },
    {
        "user_id": "user_001",
        "amount": 65.00,
        "merchant": "Shell",
        "date": datetime(2025, 10, 19),
        "category": "Transport",
        "description": "Gas refill."
    },
    {
        "user_id": "user_001",
        "amount": 98.12,
        "merchant": "Whole Foods",
        "date": datetime(2025, 10, 20),
        "category": "Groceries",
        "description": "Organic ingredients."
    },
    {
        "user_id": "user_001",
        "amount": 45.60,
        "merchant": "LCBO",
        "date": datetime(2025, 10, 20),
        "category": "Dining",
        "description": "Wine for dinner."
    },
    {
        "user_id": "user_001",
        "amount": 24.99,
        "merchant": "Apple Store",
        "date": datetime(2025, 10, 21),
        "category": "Subscription",
        "description": "iCloud storage upgrade."
    },
    {
        "user_id": "user_001",
        "amount": 72.00,
        "merchant": "Petro Canada",
        "date": datetime(2025, 10, 22),
        "category": "Transport",
        "description": "Fuel."
    },
    {
        "user_id": "user_001",
        "amount": 34.50,
        "merchant": "Cineplex",
        "date": datetime(2025, 10, 23),
        "category": "Entertainment",
        "description": "Movie night tickets."
    },
    {
        "user_id": "user_001",
        "amount": 11.99,
        "merchant": "Spotify",
        "date": datetime(2025, 10, 24),
        "category": "Subscription",
        "description": "Premium music."
    },
    {
        "user_id": "user_001",
        "amount": 18.25,
        "merchant": "McDonalds",
        "date": datetime(2025, 10, 24),
        "category": "Dining",
        "description": "Quick lunch."
    },
    {
        "user_id": "user_001",
        "amount": 156.78,
        "merchant": "IKEA",
        "date": datetime(2025, 10, 25),
        "category": "Shopping",
        "description": "Home decor."
    },
    {
        "user_id": "user_001",
        "amount": 110.00,
        "merchant": "Rogers",
        "date": datetime(2025, 10, 26),
        "category": "Utilities",
        "description": "Internet bill."
    },
    {
        "user_id": "user_001",
        "amount": 28.90,
        "merchant": "Pizza Pizza",
        "date": datetime(2025, 10, 26),
        "category": "Dining",
        "description": "Late night snack."
    },
    {
        "user_id": "user_001",
        "amount": 67.45,
        "merchant": "H&M",
        "date": datetime(2025, 10, 27),
        "category": "Shopping",
        "description": "Clothing."
    },
    {
        "user_id": "user_001",
        "amount": 500.00,
        "merchant": "E-Transfer from Parents",
        "date": datetime(2025, 10, 28),
        "category": "Income",
        "description": "Gift."
    },
    {
        "user_id": "user_001",
        "amount": 45.99,
        "merchant": "Canadian Tire",
        "date": datetime(2025, 10, 29),
        "category": "Shopping",
        "description": "Car maintenance supplies."
    },
    {
        "user_id": "user_001",
        "amount": 8.45,
        "merchant": "Tim Hortons",
        "date": datetime(2025, 10, 30),
        "category": "Dining",
        "description": "Morning coffee & bagel."
    },
    {
        "user_id": "user_001",
        "amount": 32.10,
        "merchant": "Rexall",
        "date": datetime(2025, 10, 30),
        "category": "Health",
        "description": "Pharmacy items."
    },
    {
        "user_id": "user_002",
        "amount": 500.00,
        "merchant": "Unknown Caller Gift Cards",
        "date": datetime(2025, 10, 5),
        "category": "Suspicious",
        "description": "Purchase of $500 in Google Play gift cards requested by phone caller claiming to be CRA.",
        "payment_method": "Credit Card"
    },
    {
        "user_id": "user_002",
        "amount": 1200.00,
        "merchant": "Landlord Corp",
        "date": datetime(2025, 10, 1),
        "category": "Rent",
        "description": "Monthly rent payment for Apartment 4B.",
        "payment_method": "Bank Transfer"
    },
    {
        "user_id": "user_002",
        "amount": 3500.00,
        "merchant": "TechSolutions Inc.",
        "date": datetime(2025, 9, 30),
        "category": "Income",
        "description": "Bi-weekly salary deposit.",
        "payment_method": "Direct Deposit"
    },
    {
        "user_id": "user_002",
        "amount": 92.50,
        "merchant": "Presto",
        "date": datetime(2025, 10, 5),
        "category": "Transport",
        "description": "Monthly transit pass reload.",
        "payment_method": "Debit Card"
    },
    {
        "user_id": "user_002",
        "amount": 14.99,
        "merchant": "Spotify",
        "date": datetime(2025, 10, 12),
        "category": "Subscription",
        "description": "Monthly music streaming subscription.",
        "payment_method": "Credit Card"
    },
     {
        "user_id": "user_002",
        "amount": 250.00,
        "merchant": "Transfer to Savings",
        "date": datetime(2025, 10, 1),
        "category": "Transfer",
        "description": "Automatic monthly transfer to High Interest Savings Account."
    },
     {
        "user_id": "user_002",
        "amount": 65.00,
        "merchant": "Uber Eats",
        "date": datetime(2025, 10, 14),
        "category": "Dining",
        "description": "Friday night dinner delivery.",
        "payment_method": "Credit Card"
    },
    {
        "user_id": "user_003",
        "amount": 15.99,
        "merchant": "Netflix",
        "date": datetime(2025, 10, 15),
        "category": "Subscription",
        "description": "Monthly streaming subscription fee."
    },
    {
        "user_id": "user_004",
        "amount": 89.99,
        "merchant": "Shoppers Drug Mart",
        "date": datetime(2025, 10, 10),
        "category": "Health",
        "description": "Prescription medication and vitamins."
    },
    {
        "user_id": "user_005",
        "amount": 2500.00,
        "merchant": "Best Buy",
        "date": datetime(2025, 9, 28),
        "category": "Electronics",
        "description": "Purchase of a new laptop for grandson."
    }
]
