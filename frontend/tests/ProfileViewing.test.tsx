import { render, screen } from '@testing-library/react';
import { useAuth } from '@/context/AuthContext';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import Navigation from '@/components/Navigation';
import CommentItem from '@/components/CommentItem';

// Mock the AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

describe('Profile Viewing Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Navigation UserAvatar Component', () => {
    it('should link to admin panel for admin users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: 1, name: 'Admin', role: 'admin' },
      });

      render(<Navigation />);
      
      const avatarLink = screen.getByRole('link');
      expect(avatarLink).toHaveAttribute('href', '/admin');
    });

    it('should link to user profile with ID for regular users', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: { id: 5, name: 'John Doe', role: 'user' },
      });

      render(<Navigation />);
      
      const avatarLink = screen.getByRole('link');
      expect(avatarLink).toHaveAttribute('href', '/profile?id=5');
    });

    it('should not render avatar when user is not logged in', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
      });

      render(<Navigation />);
      
      // Check that the user avatar container is not in the document
      const avatarContainer = screen.queryByText('user-avatar-container');
      expect(avatarContainer).toBeNull();
    });
  });

  describe('CommentItem Component', () => {
    const mockComment = {
      id: 1,
      content: 'Test comment',
      created_at: '2023-01-01T00:00:00Z',
      user: {
        id: 3,
        name: 'Commenter',
      },
      likes_count: 0,
      user_has_liked: false,
    };

    const mockProps = {
      comment: mockComment,
      onReact: jest.fn(),
      onDelete: jest.fn(),
    };

    it('should link to user profile with ID for authenticated comment authors', () => {
      (useAuth as jest.Mock).mockReturnValue({
        user: null,
      });

      render(<CommentItem {...mockProps} />);
      
      const authorLink = screen.getByText('Commenter').closest('a');
      expect(authorLink).toHaveAttribute('href', '/profile?id=3');
    });

    it('should link to general profile page for anonymous comment authors', () => {
      const anonymousComment = {
        ...mockComment,
        user: {
          id: null,
          name: 'Anonymous',
        },
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: null,
      });

      render(<CommentItem {...mockProps} comment={anonymousComment} />);
      
      const authorLink = screen.getByText('Анонимный пользователь').closest('a');
      expect(authorLink).toHaveAttribute('href', '/profile');
    });

    it('should display admin name for admin users (ID = 1)', () => {
      const adminComment = {
        ...mockComment,
        user: {
          id: 1,
          name: 'AdminUser',
        },
      };

      (useAuth as jest.Mock).mockReturnValue({
        user: null,
      });

      render(<CommentItem {...mockProps} comment={adminComment} />);
      
      expect(screen.getByText('admin')).toBeInTheDocument();
      const authorLink = screen.getByText('admin').closest('a');
      expect(authorLink).toHaveAttribute('href', '/profile?id=1');
    });
  });

  describe('ProfileHeader Component', () => {
    const mockUser = {
      id: 5,
      name: 'John Doe',
      username: 'johndoe',
      avatar: 'avatar.jpg',
      bio: 'Test bio',
      reputation: 100,
      level: 'Novice',
      isVerified: false,
      status: 'online',
      badges: ['Reliable'],
      last_active: '2023-01-01T00:00:00Z',
    };

    it('should render user profile information correctly', () => {
      render(<ProfileHeader user={mockUser} isOwnProfile={false} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Test bio')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument(); // Reputation value
    });

    it('should show edit button for own profile', () => {
      render(<ProfileHeader user={mockUser} isOwnProfile={true} />);
      
      expect(screen.getByText('Редактировать')).toBeInTheDocument();
    });

    it('should show action buttons for other users\' profiles', () => {
      render(<ProfileHeader user={mockUser} isOwnProfile={false} />);
      
      expect(screen.getByText('Написать')).toBeInTheDocument();
      expect(screen.getByText('В друзья')).toBeInTheDocument();
    });
  });
});