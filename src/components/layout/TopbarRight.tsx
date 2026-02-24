import ProfileDropdown from './ProfileDropdown';

interface TopbarRightProps {
    role: 'instructor' | 'student';
}

const TopbarRight = ({ role }: TopbarRightProps) => {
    return (
        <div className="top-nav-right">
            <ProfileDropdown role={role} />
        </div>
    );
};

export default TopbarRight;
