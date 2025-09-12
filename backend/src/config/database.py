import pymysql
import os
from dotenv import load_dotenv
import logging
from contextlib import contextmanager

load_dotenv()

logger = logging.getLogger(__name__)

class DatabaseConfig:
    """Database configuration for TiDB Cloud"""
    
    def __init__(self):
        # TiDB Cloud connection parameters
        self.host = os.getenv('TIDB_HOST', 'gateway01.us-west-2.prod.aws.tidbcloud.com')
        self.port = int(os.getenv('TIDB_PORT', '4000'))
        self.user = os.getenv('TIDB_USER', 'your_username')
        self.password = os.getenv('TIDB_PASSWORD', 'your_password')
        self.database = os.getenv('TIDB_DATABASE', 'resume_tracker')
        self.ssl_disabled = os.getenv('TIDB_SSL_DISABLED', 'False').lower() == 'true'
        
        # SSL configuration for TiDB Cloud
        self.ssl_ca = os.getenv('TIDB_SSL_CA', None)
        self.ssl_cert = os.getenv('TIDB_SSL_CERT', None)
        self.ssl_key = os.getenv('TIDB_SSL_KEY', None)
        
        # Connection pool settings
        self.max_connections = int(os.getenv('TIDB_MAX_CONNECTIONS', '10'))
        self.connect_timeout = int(os.getenv('TIDB_CONNECT_TIMEOUT', '10'))
        self.read_timeout = int(os.getenv('TIDB_READ_TIMEOUT', '30'))
        self.write_timeout = int(os.getenv('TIDB_WRITE_TIMEOUT', '30'))

    def get_connection_params(self):
        """Get connection parameters for TiDB Cloud"""
        params = {
            'host': self.host,
            'port': self.port,
            'user': self.user,
            'password': self.password,
            'database': self.database,
            'charset': 'utf8mb4',
            'autocommit': True,
            'connect_timeout': self.connect_timeout,
            'read_timeout': self.read_timeout,
            'write_timeout': self.write_timeout,
        }
        
        # SSL configuration for TiDB Cloud
        if not self.ssl_disabled:
            # For TiDB Cloud, we need to enable SSL with proper configuration
            import ssl
            params['ssl'] = {
                'ssl_disabled': False,
                'check_hostname': False,
                'verify_mode': ssl.CERT_NONE
            }
        else:
            params['ssl_disabled'] = True
            
        return params

    @contextmanager
    def get_connection(self):
        """Get a database connection with proper error handling"""
        connection = None
        try:
            connection = pymysql.connect(**self.get_connection_params())
            logger.info("Database connection established successfully")
            yield connection
        except pymysql.Error as e:
            logger.error(f"Database connection error: {e}")
            if connection:
                connection.rollback()
            raise
        except Exception as e:
            logger.error(f"Unexpected database error: {e}")
            if connection:
                connection.rollback()
            raise
        finally:
            if connection:
                connection.close()
                logger.info("Database connection closed")

    def test_connection(self):
        """Test database connection"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1")
                    result = cursor.fetchone()
                    logger.info("Database connection test successful")
                    return True
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False

# Global database config instance
db_config = DatabaseConfig()
