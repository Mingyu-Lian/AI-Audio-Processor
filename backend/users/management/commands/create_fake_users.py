from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create fake user accounts for development'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=10,
            help='Number of fake users to create (default: 10)',
        )

    def handle(self, *args, **options):
        count = options['count']
        
        with transaction.atomic():
            # Create admin user first
            admin_email = 'admin@example.com'
            admin_password = '123123'
            
            if User.objects.filter(email=admin_email).exists():
                self.stdout.write(
                    self.style.WARNING(f'Admin user {admin_email} already exists, skipping...')
                )
            else:
                admin_user = User.objects.create_user(
                    username='admin',
                    email=admin_email,
                    password=admin_password,
                    is_staff=True,
                    is_superuser=True,
                    credits=1000  # Give admin more credits
                )
                self.stdout.write(
                    self.style.SUCCESS(f'Created admin user: {admin_email} (password: {admin_password})')
                )

            # Create fake users
            fake_users_data = [
                {'username': 'john_doe', 'email': 'john.doe@example.com', 'password': 'password123'},
                {'username': 'jane_smith', 'email': 'jane.smith@example.com', 'password': 'password123'},
                {'username': 'alice_brown', 'email': 'alice.brown@example.com', 'password': 'password123'},
                {'username': 'bob_wilson', 'email': 'bob.wilson@example.com', 'password': 'password123'},
                {'username': 'charlie_davis', 'email': 'charlie.davis@example.com', 'password': 'password123'},
                {'username': 'diana_miller', 'email': 'diana.miller@example.com', 'password': 'password123'},
                {'username': 'edward_jones', 'email': 'edward.jones@example.com', 'password': 'password123'},
                {'username': 'fiona_garcia', 'email': 'fiona.garcia@example.com', 'password': 'password123'},
                {'username': 'george_martinez', 'email': 'george.martinez@example.com', 'password': 'password123'},
                {'username': 'helen_anderson', 'email': 'helen.anderson@example.com', 'password': 'password123'},
            ]

            created_count = 0
            for i in range(min(count, len(fake_users_data))):
                user_data = fake_users_data[i]
                
                if User.objects.filter(email=user_data['email']).exists():
                    self.stdout.write(
                        self.style.WARNING(f'User {user_data["email"]} already exists, skipping...')
                    )
                    continue
                
                user = User.objects.create_user(
                    username=user_data['username'],
                    email=user_data['email'],
                    password=user_data['password'],
                    credits=random.randint(30, 100)  # Random credits between 30-100
                )
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created user: {user_data["email"]} (password: {user_data["password"]})')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\nSuccessfully created {created_count} fake users!')
        )
        self.stdout.write(
            self.style.WARNING('\nRemember to run migrations first: python manage.py migrate')
        )
        self.stdout.write(
            self.style.WARNING('Admin credentials: admin@example.com / 123123')
        ) 